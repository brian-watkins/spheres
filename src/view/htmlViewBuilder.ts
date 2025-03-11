import { Container, GetState, State, Stateful } from "../store/index.js"
import { makeZoneList, VirtualListItemTemplate, VirtualTemplate, VirtualNode, ViewSelector, makeStatefulSelector, StatefulSelectorNode } from "./render/virtualNode.js"
import { HTMLElements, HTMLBuilder, HTMLView, SpecialHTMLElements, HTMLViewSelector, GlobalHTMLAttributes } from "./htmlElements.js"
import { SVGElements } from "./svgElements.js"
import { BasicElementConfig } from "./viewConfig.js"
import { ConfigurableElement, ViewBuilder } from "./viewBuilder.js"
import { buildSvgElement } from "./svgViewBuilder.js"
import { recordTokens } from "../store/state/stateRecorder.js"
import { SpecialElementAttributes } from "./specialAttributes.js"

class HTMLElementConfig extends BasicElementConfig {
  class(value: string | Stateful<string>): this {
    return this.recordProperty("className", value)
  }
}

export const configBuilder = new HTMLElementConfig()

class InputElementConfig extends HTMLElementConfig {
  value(val: string | Stateful<string>) {
    return this.recordProperty("value", val)
  }

  checked(value: boolean | Stateful<boolean>) {
    return this.recordProperty("checked", value)
  }
}

export const inputConfigBuilder = new InputElementConfig()

export class HtmlViewBuilder extends ViewBuilder<SpecialElementAttributes & GlobalHTMLAttributes, HTMLElements> implements SpecialHTMLElements {
  subview(view: HTMLView): this {
    const builder = new HtmlViewBuilder()
    view(builder as unknown as HTMLBuilder)
    this.storeNode(builder.toVirtualNode())

    return this
  }

  subviewOf(selectorGenerator: (selector: HTMLViewSelector) => void): this {
    const selectorBuilder = new SelectorBuilder()
    selectorGenerator(selectorBuilder)
    this.storeNode(selectorBuilder.getStatefulSelectorNode())

    return this
  }

  subviews<T>(data: (get: GetState) => Array<T>, viewGenerator: (item: State<T>, index: State<number>) => HTMLView): this {
    const virtualTemplate = new HTMLVirtualListItemTemplate(viewGenerator as (item: State<T>, index?: State<number>) => HTMLView)
    this.storeNode(makeZoneList(virtualTemplate, data))

    return this
  }

  element(tag: string, builder?: ((element: ConfigurableElement<SpecialElementAttributes & GlobalHTMLAttributes, HTMLElements>) => void) | undefined): this {
    return this.buildElement(tag, configBuilder, builder)
  }

  svg(builder?: (element: ConfigurableElement<SpecialElementAttributes, SVGElements>) => void) {
    this.storeNode(buildSvgElement(builder))
    return this
  }

  input(builder?: (element: ConfigurableElement<SpecialElementAttributes, HTMLElements>) => void) {
    return this.buildElement("input", inputConfigBuilder, builder)
  }
}

export class SelectorBuilder implements HTMLViewSelector {
  private selectors: Array<ViewSelector> = []
  private defaultView: HTMLView | undefined

  when(predicate: (get: GetState) => boolean, view: HTMLView): HTMLViewSelector {
    this.selectors.push({
      select: predicate,
      template: this.getTemplateForView(view)
    })

    return this
  }

  default(view: HTMLView) {
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

  private getTemplateForView(view: HTMLView): VirtualTemplate {
    const viewBuilder = new HtmlViewBuilder()
    view(viewBuilder as unknown as HTMLBuilder)
    const vnode = viewBuilder.toVirtualNode()
    return new HTMLViewTemplate(vnode)
  }
}

export class HTMLViewTemplate extends VirtualTemplate {
  constructor(vnode: VirtualNode) {
    super()
    this.setVirtualNode(vnode)
  }
}

export class HTMLVirtualListItemTemplate<T> extends VirtualListItemTemplate<T> {
  constructor(generator: (item: State<T>, index?: State<number>) => HTMLView) {
    super()

    this.usesIndex = generator.length == 2

    const builder = new HtmlViewBuilder()

    let indexToken: Container<number> | undefined = undefined
    if (this.usesIndex) {
      indexToken = this.indexToken
    }

    recordTokens(() => {
      generator(this.itemToken as State<T>, indexToken)(builder as unknown as HTMLBuilder)
    })
      .forEach(token => this.addToken(token))

    // we're creating and storing a virtual node here
    // but maybe instead we need to have a TemplateRenderer or something?
    // but for string rendering it will be different?
    // ultimately, we need to build an HTMLTemplate plus the
    // list of effects and locations to attach them. That's the DOMTemplate basically
    this.setVirtualNode(builder.toVirtualNode())
  }
}
