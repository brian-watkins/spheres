import { GetState, State } from "../store/index.js"
import { Stateful, StatefulSelectorNode, ViewSelector, VirtualListItemTemplate, VirtualNode, VirtualNodeConfig, VirtualTemplate, makeStatefulSelector, makeVirtualElement, makeZoneList, setNamespace, virtualNodeConfig } from "./vdom/virtualNode.js"
import { SVGBuilder, SVGElements, SVGElementAttributes, svgAttributeNames } from "./svgElements.js"
import { ConfigurableElement, ViewBuilder } from "./viewBuilder.js"
import { BasicElementConfig, SpecialElementAttributes } from "./viewConfig.js"

export type SVGView = (root: SVGBuilder) => void

export interface SVGViewSelector {
  when(predicate: (get: GetState) => boolean, view: SVGView): SVGViewSelector
  default(view: SVGView): void
}

export interface SpecialSVGElements {
  element(tag: string, builder?: (element: ConfigurableElement<SpecialElementAttributes, SVGElements>) => void): this
  textNode(value: string | Stateful<string>): this
  zone(view: SVGView): this
  subviewOf(selectorGenerator: (selector: SVGViewSelector) => void): this
  zones<T>(data: (get: GetState) => Array<T>, viewGenerator: (item: State<T>, index: State<number>) => SVGView): this
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
  zone(view: SVGView): this {
    const builder = new SvgViewBuilder()
    view(builder as unknown as SVGBuilder)
    this.storeNode(builder.toVirtualNode())
    return this
  }

  subviewOf(selectorGenerator: (selector: SVGViewSelector) => void): this {
    const selectorBuilder = new SelectorBuilder()
    selectorGenerator(selectorBuilder)
    this.storeNode(selectorBuilder.getStatefulSelectorNode())

    return this
  }

  zones<T>(data: (get: GetState) => Array<T>, viewGenerator: (item: State<T>, index: State<number>) => SVGView): this {
    const virtualTemplate = new SVGVirtualListItemTemplate(viewGenerator)
    this.storeNode(makeZoneList(virtualTemplate, data))

    return this
  }

  element(tag: string, builder?: ((element: ConfigurableElement<SpecialElementAttributes, SVGElements>) => void) | undefined): this {
    return this.buildElement(tag, svgConfigBuilder, builder)
  }
}

class SVGViewTemplate extends VirtualTemplate<undefined> {
  constructor(vnode: VirtualNode) {
    super()
    this.setVirtualNode(vnode)
  }

  setArgs(): void { }
}


class SVGVirtualListItemTemplate<T> extends VirtualListItemTemplate<T> {
  constructor(generator: (item: State<T>, index: State<number>) => SVGView) {
    super()

    this.usesIndex = generator.length == 2

    const builder = new SvgViewBuilder()
    generator(this.itemToken as State<T>, this.indexToken)(builder as unknown as SVGBuilder)
    this.setVirtualNode(builder.toVirtualNode())
  }
}

class SelectorBuilder implements SVGViewSelector {
    private selectors: Array<ViewSelector> = []
    private defaultView: SVGView | undefined

    when(predicate: (get: GetState) => boolean, view: SVGView): SVGViewSelector {
      this.selectors.push({
        select: predicate,
        template: this.getTemplateForView(view)
      })

      return this
    }

    default(view: SVGView) {
      this.defaultView = view
    }

    getStatefulSelectorNode(): StatefulSelectorNode {
      if (this.defaultView !== undefined) {
        this.selectors.push({
          select: () => true,
          template: this.getTemplateForView(this.defaultView)
        })
      }
      return makeStatefulSelector(this.selectors)
    }

    private getTemplateForView(view: SVGView): VirtualTemplate<any> {
      const viewBuilder = new SvgViewBuilder()
      view(viewBuilder as unknown as SVGBuilder)
      const vnode = viewBuilder.toVirtualNode()
      return new SVGViewTemplate(vnode)
    }
}
