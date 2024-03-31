import { GetState } from "@spheres/store"
import { Stateful, VirtualNode, VirtualNodeConfig, VirtualTemplate, WithArgs, makeStatefulElement, makeTemplate, makeVirtualElement, setNamespace, virtualNodeConfig } from "./vdom/virtualNode.js"
import { SVGBuilder, SVGElements, SVGElementAttributes, svgAttributeNames } from "./svgElements.js"
import { ConfigurableElement, ViewBuilder, ViewOptions, ViewArgs } from "./viewBuilder.js"
import { BasicElementConfig, SpecialElementAttributes } from "./viewConfig.js"

export type SVGView = (root: SVGBuilder) => void
export type ReactiveSvgViewFunction = (get: GetState) => void

const template: unique symbol = Symbol();
const templateArgs: unique symbol = Symbol();

export interface SVGTemplateView<T> {
  [template]: SVGVirtualTemplate<T>
  [templateArgs]: T
}

export interface SpecialSVGElements {
  element(tag: string, builder?: (element: ConfigurableElement<SpecialElementAttributes, SVGElements>) => void): this
  textNode(value: string | Stateful<string>): this
  zone(view: SVGTemplateView<any> | ((get: GetState) => SVGView), options?: ViewOptions): this
}

function toReactiveVirtualNode(generator: (get: GetState) => SVGView, get: GetState): VirtualNode {
  const builder = new SvgViewBuilder()
  generator(get)(builder as unknown as SVGBuilder)
  return builder.toVirtualNode()
}

class SVGElementConfig extends BasicElementConfig {
  recordAttribute(attributeAlias: string, value: string | Stateful<string>): this {
    const attribute = svgAttributeNames.get(attributeAlias) ?? attributeAlias
    return super.recordAttribute(attribute, value)
  }

  resetConfig(config: VirtualNodeConfig): void {
    setNamespace(config, "http://www.w3.org/2000/svg")
    super.resetConfig(config)
  }
}

const svgConfigBuilder = new SVGElementConfig()

export function buildSvgElement(builder?: (element: ConfigurableElement<SpecialElementAttributes, SVGElements>) => void) {
  const config = virtualNodeConfig()
  svgConfigBuilder.resetConfig(config)
  const view = new SvgViewBuilder()
  builder?.({
    config: svgConfigBuilder as unknown as SVGElementAttributes,
    children: view as unknown as SVGElements
  })
  return makeVirtualElement("svg", config, view.nodes)
}

export class SvgViewBuilder extends ViewBuilder<SpecialElementAttributes, SVGElements> implements SpecialSVGElements {
  zone(view: SVGTemplateView<any> | ((get: GetState) => SVGView), options?: ViewOptions | undefined): this {
    if (typeof view === "function") {
      this.storeNode(makeStatefulElement((get) => toReactiveVirtualNode(view, get), options?.key))
    } else {
      this.storeNode(makeTemplate(view[template], view[templateArgs], options?.key))
    }

    return this
  }

  element(tag: string, builder?: ((element: ConfigurableElement<SpecialElementAttributes, SVGElements>) => void) | undefined): this {
    return this.buildElement(tag, svgConfigBuilder, builder)
  }
}

export class SVGVirtualTemplate<T> extends VirtualTemplate<T> {
  constructor(generator: (withArgs: WithArgs<T>) => SVGView, protected args: T) {
    super()

    const builder = new SvgViewBuilder()

    generator((handler) => {
      return (get) => {
        return handler(this.args, get)
      }
    })(builder as unknown as SVGBuilder)

    this.virtualNode = builder.toVirtualNode()
  }
}

export function svgTemplate<P = undefined>(definition: (withProps: WithArgs<P>) => SVGView): (...props: ViewArgs<P>) => SVGTemplateView<P> {
  let virtualTemplate: SVGVirtualTemplate<P> | undefined

  return (...args: ViewArgs<P>) => {
    const viewArgs: any = args.length == 0 ? undefined : args[0]

    if (virtualTemplate === undefined) {
      virtualTemplate = new SVGVirtualTemplate(definition, viewArgs)
    }

    return {
      [template]: virtualTemplate,
      [templateArgs]: viewArgs
    }
  }
}
