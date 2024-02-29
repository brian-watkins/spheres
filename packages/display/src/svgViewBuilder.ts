import { GetState } from "@spheres/store"
import { Stateful, VirtualNode, VirtualNodeConfig, makeStatefulElement, makeTemplate, makeVirtualElement, setNamespace, virtualNodeConfig } from "./vdom/virtualNode"
import { SVGBuilder, SVGElements, SVGElementAttributes, svgAttributeNames } from "./svgElements"
import { ConfigurableElement, ViewBuilder, ViewOptions } from "./viewBuilder"
import { BasicElementConfig, SpecialElementAttributes } from "./viewConfig"

export type SvgViewFunction<T> = (root: SVGBuilder<T>) => void
export type ReactiveSvgViewFunction<T> = (root: SVGBuilder<T>, get: GetState, context: T) => void

export interface SpecialSVGElements<Context> {
  element(tag: string, builder?: (element: ConfigurableElement<SpecialElementAttributes<Context>, SVGElements<Context>, Context>) => void): this
  textNode(value: string | Stateful<string, Context>): this
  zone<T>(definition: SvgViewFunction<T> | ReactiveSvgViewFunction<T>, options?: ViewOptions<T>): this
}

function toVirtualNode<T>(view: SvgViewFunction<T>): VirtualNode {
  const builder = new SvgViewBuilder()
  view(builder as unknown as SVGBuilder<T>)
  return builder.toVirtualNode()
}

function toReactiveVirtualNode<T>(view: ReactiveSvgViewFunction<T>, get: GetState, context: T): VirtualNode {
  const builder = new SvgViewBuilder()
  view(builder as unknown as SVGBuilder<T>, get, context)
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

export function buildSvgElement(builder?: (element: ConfigurableElement<SpecialElementAttributes<any>, SVGElements<any>, any>) => void) {
  const config = virtualNodeConfig()
  svgConfigBuilder.resetConfig(config)
  const view = new SvgViewBuilder()
  builder?.({
    config: svgConfigBuilder as unknown as SVGElementAttributes<any>,
    children: view as unknown as SVGElements<any>
  })
  return makeVirtualElement("svg", config, view.nodes)
}

export class SvgViewBuilder extends ViewBuilder<SpecialElementAttributes<any>, SVGElements<any>, any> {
  element(tag: string, builder?: ((element: ConfigurableElement<SpecialElementAttributes<any>, SVGElements<any>, any>) => void) | undefined): this {
    return this.buildElement(tag, svgConfigBuilder, builder)
  }

  zone<T>(definition: SvgViewFunction<T> | ReactiveSvgViewFunction<T>, options?: ViewOptions<T>) {
    if (definition.length > 1) {
      this.storeNode(makeStatefulElement((get, context) => toReactiveVirtualNode(definition, get, context), options?.key))
    } else {
      let vnode = this.getTemplateNode(definition)
      if (vnode === undefined) {
        vnode = toVirtualNode(definition as SvgViewFunction<any>)
        this.setTemplateNode(definition, vnode)
      }
      this.storeNode(makeTemplate(vnode, options?.props, options?.key))
    }

    return this
  }
}
