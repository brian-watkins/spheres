import { GetState, State, Store } from "../store/index.js"
import { makeStatefulElement, Stateful, addStatefulProperty, addProperty, makeVirtualTextNode, makeZoneList, VirtualListItemTemplate } from "./vdom/virtualNode.js"
import { HTMLElements, HTMLBuilder } from "./htmlElements.js"
import { createStringRenderer } from "./vdom/renderToString.js"
import { createDOMRenderer } from "./vdom/renderToDom.js"
import { SVGElements } from "./svgElements.js"
import { BasicElementConfig, SpecialElementAttributes } from "./viewConfig.js"
import { ConfigurableElement, ViewBuilder, ViewOptions } from "./viewBuilder.js"
import { buildSvgElement } from "./svgViewBuilder.js"

// Renderers

export interface RenderResult {
  root: Node
  unmount: () => void
}

export function renderToDOM(store: Store, element: Element, view: HTMLView): RenderResult {
  const render = createDOMRenderer(store)
  const builder = new HtmlViewBuilder()
  builder.zone(view)
  const renderResult = render(element, builder.toVirtualNode())

  return {
    root: renderResult.root,
    unmount: () => {
      renderResult.root.parentNode?.removeChild(renderResult.root)
    }
  }
}

export function renderToString(store: Store, view: HTMLView): string {
  const render = createStringRenderer(store)
  const builder = new HtmlViewBuilder()
  builder.zone(view)
  return render(builder.toVirtualNode())
}


// View

export type HTMLView = (root: HTMLBuilder) => void

export interface SpecialHTMLElements {
  element(tag: string, builder?: (element: ConfigurableElement<SpecialElementAttributes, HTMLElements>) => void): this
  textNode(value: string | Stateful<string>): this
  zone(view: HTMLView, options?: ViewOptions): this
  zoneShow(when: (get: GetState) => boolean, view: HTMLView): this
  zones<T>(data: Stateful<Array<T>>, viewGenerator: (item: State<T>, index: State<number>) => HTMLView): this
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
  zone(view: HTMLView, _?: ViewOptions | undefined): this {
    const builder = new HtmlViewBuilder()
    view(builder as unknown as HTMLBuilder)
    this.storeNode(builder.toVirtualNode())

    return this
  }

  zoneShow(when: (get: GetState) => boolean, view: HTMLView): this {
    const viewBuilder = new HtmlViewBuilder()
    view(viewBuilder as unknown as HTMLBuilder)
    const viewVirtualNode = viewBuilder.toVirtualNode()

    const emptyTextNode = makeVirtualTextNode("")

    this.storeNode(makeStatefulElement(get => {
      return when(get) ? viewVirtualNode : emptyTextNode
    }, undefined))

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

export class HTMLVirtualListItemTemplate<T> extends VirtualListItemTemplate<T> {
  constructor(generator: (item: State<T>, index: State<number>) => HTMLView) {
    super()

    this.usesIndex = generator.length == 2

    const builder = new HtmlViewBuilder()
    generator(this.itemToken as State<T>, this.indexToken)(builder as unknown as HTMLBuilder)
    this.virtualNode = builder.toVirtualNode()
  }
}
