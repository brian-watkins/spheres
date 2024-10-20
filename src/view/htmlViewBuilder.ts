import { GetState, State, Store } from "../store/index.js"
import { Stateful, addStatefulProperty, addProperty, makeZoneList, VirtualListItemTemplate, makeStatefulSwitch, VirtualTemplate, VirtualNode } from "./vdom/virtualNode.js"
import { HTMLElements, HTMLBuilder } from "./htmlElements.js"
import { SVGElements } from "./svgElements.js"
import { BasicElementConfig, SpecialElementAttributes } from "./viewConfig.js"
import { ConfigurableElement, ViewBuilder } from "./viewBuilder.js"
import { buildSvgElement } from "./svgViewBuilder.js"
import { stringifyVirtualNode } from "./vdom/renderToString.js"
import { DOMRoot } from "./vdom/renderToDom.js"
import { RenderResult } from "./vdom/render.js"
import { IdentifierGenerator } from "./vdom/idGenerator.js"
export type { RenderResult } from "./vdom/render.js"

export function activateView(store: Store, element: Element, view: HTMLView) {
  const builder = new HtmlViewBuilder()
  view(builder as unknown as HTMLBuilder)
  const vnode = builder.toVirtualNode()

  const root = new DOMRoot(store, element)
  root.activate(vnode)
}

export function renderToDOM(store: Store, element: Element, view: HTMLView): RenderResult {
  const builder = new HtmlViewBuilder()
  view(builder as unknown as HTMLBuilder)
  const vnode = builder.toVirtualNode()

  const root = new DOMRoot(store, element)
  root.mount(vnode)

  return root
}

export function renderToString(store: Store, view: HTMLView): string {
  const builder = new HtmlViewBuilder()
  builder.zone(view)
  return stringifyVirtualNode(store, new IdentifierGenerator(), builder.toVirtualNode())
}


// View

export type HTMLView = (root: HTMLBuilder) => void

export interface SpecialHTMLElements {
  element(tag: string, builder?: (element: ConfigurableElement<SpecialElementAttributes, HTMLElements>) => void): this
  textNode(value: string | Stateful<string>): this
  zone(view: HTMLView): this
  zoneWhich<T extends { [key: string]: HTMLView }>(selector: Stateful<keyof T>, zones: T): this
  zones<T>(data: (get: GetState) => Array<T>, viewGenerator: (item: State<T>, index: State<number>) => HTMLView): this
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
  zone(view: HTMLView): this {
    const builder = new HtmlViewBuilder()
    view(builder as unknown as HTMLBuilder)
    this.storeNode(builder.toVirtualNode())

    return this
  }

  zoneWhich<T extends { [key: string]: HTMLView }>(selector: Stateful<keyof T>, zones: T): this {
    const templates: { [key: string]: VirtualTemplate<any> } = {}

    for (const key in zones) {
      const view = zones[key]
      const viewBuilder = new HtmlViewBuilder()
      view(viewBuilder as unknown as HTMLBuilder)
      const vnode = viewBuilder.toVirtualNode()
      templates[key] = new HTMLViewTemplate(vnode)
    }

    this.storeNode(makeStatefulSwitch(selector, templates))

    return this
  }

  zones<T>(data: (get: GetState) => Array<T>, viewGenerator: (item: State<T>, index: State<number>) => HTMLView): this {
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

export class HTMLViewTemplate extends VirtualTemplate<undefined> {
  constructor(vnode: VirtualNode) {
    super()
    this.setVirtualNode(vnode)
  }

  setArgs(): void { }
}

export class HTMLVirtualListItemTemplate<T> extends VirtualListItemTemplate<T> {
  constructor(generator: (item: State<T>, index: State<number>) => HTMLView) {
    super()

    this.usesIndex = generator.length == 2

    const builder = new HtmlViewBuilder()
    generator(this.itemToken as State<T>, this.indexToken)(builder as unknown as HTMLBuilder)
    this.setVirtualNode(builder.toVirtualNode())
  }
}
