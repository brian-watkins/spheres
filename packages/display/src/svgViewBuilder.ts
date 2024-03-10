import { GetState } from "@spheres/store"
import { Stateful, VirtualNode, VirtualNodeConfig, VirtualTemplate, WithProps, makeBlockElement, makeStatefulElement, makeVirtualElement, setNamespace, virtualNodeConfig } from "./vdom/virtualNode.js"
import { SVGBuilder, SVGElements, SVGElementAttributes, svgAttributeNames } from "./svgElements.js"
import { ConfigurableElement, ViewBuilder, ViewOptions } from "./viewBuilder.js"
import { BasicElementConfig, SpecialElementAttributes } from "./viewConfig.js"

export type SVGView = (root: SVGBuilder) => void
export type ReactiveSvgViewFunction = (get: GetState) => void

export interface SpecialSVGElements {
  element(tag: string, builder?: (element: ConfigurableElement<SpecialElementAttributes, SVGElements>) => void): this
  textNode(value: string | Stateful<string>): this
  zone(definition: SVGView, options?: ViewOptions): this
  zoneWithState(generator: (root: SVGBuilder, get: GetState) => void, options?: ViewOptions): this
  zoneWithTemplate<T>(template: (root: SVGBuilder, withProps: WithProps<T>) => void, props: T, options?: ViewOptions): this
}

function toVirtualNode(view: SVGView): VirtualNode {
  const builder = new SvgViewBuilder()
  view(builder as unknown as SVGBuilder)
  return builder.toVirtualNode()
}

function toReactiveVirtualNode(generator: (root: SVGBuilder, get: GetState) => void, get: GetState): VirtualNode {
  const builder = new SvgViewBuilder()
  generator(builder as unknown as SVGBuilder, get)
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
  zone(definition: SVGView, options?: ViewOptions | undefined): this {
    this.storeNode(makeBlockElement(() => toVirtualNode(definition), options?.key))
    return this
  }

  zoneWithState(generator: (root: SVGBuilder, get: GetState) => void, options?: ViewOptions | undefined): this {
    this.storeNode(makeStatefulElement((get) => toReactiveVirtualNode(generator, get), options?.key))
    return this
  }

  zoneWithTemplate<T>(template: (root: SVGBuilder, withProps: WithProps<T>) => void, props: T, _?: ViewOptions | undefined): this {
    let virtualTemplate = this.getVirtualTemplate(template)
    if (virtualTemplate === undefined) {
      virtualTemplate = new SVGVirtualTemplate(template, props)
      this.setVirtualTemplate(template, virtualTemplate)
    }
    // this.storeNode(makeTemplate(virtualTemplate, props, options?.key))
    return this
  }

  element(tag: string, builder?: ((element: ConfigurableElement<SpecialElementAttributes, SVGElements>) => void) | undefined): this {
    return this.buildElement(tag, svgConfigBuilder, builder)
  }
}

export class SVGVirtualTemplate<T> extends VirtualTemplate<T> {
  constructor(generator: (root: SVGBuilder, withProps: WithProps<T>) => void, protected props: T) {
    super()

    const builder = new SvgViewBuilder()

    generator(builder as unknown as SVGBuilder, (handler) => {
      return (arg1, arg2) => {
        return handler(this.props, arg1, arg2)
      }
    })

    this.virtualNode = builder.toVirtualNode()
  }
}