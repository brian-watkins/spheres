import { Container, GetState, State, Store } from "../store/index.js"
import { Stateful, addStatefulProperty, addProperty, makeZoneList, VirtualListItemTemplate, VirtualTemplate, VirtualNode, ViewSelector, makeStatefulSelector, StatefulSelectorNode } from "./render/virtualNode.js"
import { HTMLElements, HTMLBuilder } from "./htmlElements.js"
import { SVGElements } from "./svgElements.js"
import { BasicElementConfig, SpecialElementAttributes } from "./viewConfig.js"
import { ConfigurableElement, ViewBuilder } from "./viewBuilder.js"
import { buildSvgElement } from "./svgViewBuilder.js"
import { stringifyVirtualNode } from "./render/renderToString.js"
import { DOMRoot } from "./render/renderToDom.js"
import { RenderResult } from "./render/index.js"
import { IdSequence } from "./render/idSequence.js"
import { recordTokens } from "../store/state/stateRecorder.js"
import { getTokenRegistry } from "../store/store.js"
export type { RenderResult } from "./render/index.js"

export function activateView(store: Store, element: Element, view: HTMLView): RenderResult {
  const builder = new HtmlViewBuilder()
  view(builder as unknown as HTMLBuilder)
  const vnode = builder.toVirtualNode()

  const root = new DOMRoot(getTokenRegistry(store), element)
  root.activate(vnode)

  return root
}

export function renderToDOM(store: Store, element: Element, view: HTMLView): RenderResult {
  const builder = new HtmlViewBuilder()
  view(builder as unknown as HTMLBuilder)
  const vnode = builder.toVirtualNode()

  const root = new DOMRoot(getTokenRegistry(store), element)
  root.mount(vnode)

  return root
}

export function renderToString(store: Store, view: HTMLView): string {
  const builder = new HtmlViewBuilder()
  builder.subview(view)
  return stringifyVirtualNode(getTokenRegistry(store), new IdSequence(), builder.toVirtualNode())
}


// View

export type HTMLView = (root: HTMLBuilder) => void

export interface HTMLViewSelector {
  when(predicate: (get: GetState) => boolean, view: HTMLView): HTMLViewSelector
  default(view: HTMLView): void
}

export interface SpecialHTMLElements {
  element(tag: string, builder?: (element: ConfigurableElement<SpecialElementAttributes, HTMLElements>) => void): this
  textNode(value: string | Stateful<string>): this
  subview(view: HTMLView): this
  subviewOf(selectorGenerator: (selector: HTMLViewSelector) => void): this
  subviews<T>(data: (get: GetState) => Array<T>, viewGenerator: (item: State<T>, index?: State<number>) => HTMLView): this
}

class HTMLElementConfig extends BasicElementConfig {
  class(value: string | Stateful<string>): this {
    if (typeof value === "function") {
      addStatefulProperty(this.config, "className", value)
    } else {
      addProperty(this.config, "className", value)
    }

    return this
  }
}

const configBuilder = new HTMLElementConfig()

class InputElementConfig extends HTMLElementConfig {
  value(val: string | Stateful<string>) {
    if (typeof val === "function") {
      addStatefulProperty(this.config, "value", val)
    } else {
      addProperty(this.config, "value", val)
    }

    return this
  }

  checked(value: boolean | Stateful<boolean>) {
    this.recordBooleanProperty("checked", value)

    return this
  }
}

const inputConfigBuilder = new InputElementConfig()

class HtmlViewBuilder extends ViewBuilder<SpecialElementAttributes, HTMLElements> implements SpecialHTMLElements {
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

  subviews<T>(data: (get: GetState) => Array<T>, viewGenerator: (item: State<T>, index?: State<number>) => HTMLView): this {
    const virtualTemplate = new HTMLVirtualListItemTemplate(viewGenerator)
    this.storeNode(makeZoneList(virtualTemplate, data))

    return this
  }

  element(tag: string, builder?: ((element: ConfigurableElement<SpecialElementAttributes, HTMLElements>) => void) | undefined): this {
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

class SelectorBuilder implements HTMLViewSelector {
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

    this.setVirtualNode(builder.toVirtualNode())
  }
}
