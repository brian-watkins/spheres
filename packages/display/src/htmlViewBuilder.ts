import { GetState, Store } from "@spheres/store"
import { VirtualNode, makeStatefulElement, Stateful, makeTemplate, addStatefulProperty, addProperty, VirtualTemplate, WithProps } from "./vdom/virtualNode.js"
import { HTMLElements, HTMLBuilder } from "./htmlElements.js"
import { createStringRenderer } from "./vdom/renderToString.js"
import { createDOMRenderer } from "./vdom/renderToDom.js"
import { SVGElements } from "./svgElements.js"
import { BasicElementConfig, SpecialElementAttributes } from "./viewConfig.js"
import { ConfigurableElement, ViewBuilder, ViewOptions, ViewProps } from "./viewBuilder.js"
import { buildSvgElement } from "./svgViewBuilder.js"

// Renderers

export interface RenderResult {
  root: Node
  unmount: () => void
}

export function renderToDOM(store: Store, element: Element, view: HTMLDisplay): RenderResult {
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

export function renderToString(store: Store, view: HTMLDisplay): string {
  const render = createStringRenderer(store)
  const builder = new HtmlViewBuilder()
  builder.zone(view)
  return render(builder.toVirtualNode())
}


// View

export type HTMLView = (root: HTMLBuilder) => void

const template: unique symbol = Symbol();
const templateProps: unique symbol = Symbol();

export interface HTMLTemplateView<T> {
  [template]: HTMLVirtualTemplate<T>
  [templateProps]: T
}

export type HTMLDisplay = HTMLTemplateView<any> | ((get: GetState) => HTMLView)

export interface SpecialHTMLElements {
  element(tag: string, builder?: (element: ConfigurableElement<SpecialElementAttributes, HTMLElements>) => void): this
  textNode(value: string | Stateful<string>): this
  zone(view: HTMLDisplay, options?: ViewOptions): this
}

const configBuilder = new BasicElementConfig()

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

function toReactiveVirtualNode(generator: (get: GetState) => HTMLView, get: GetState): VirtualNode {
  const builder = new HtmlViewBuilder()
  generator(get)(builder as unknown as HTMLBuilder)
  return builder.toVirtualNode()
}

class HtmlViewBuilder extends ViewBuilder<SpecialElementAttributes, HTMLElements> implements SpecialHTMLElements {
  zone(view: HTMLDisplay, options?: ViewOptions | undefined): this {
    if (typeof view === "function") {
      this.storeNode(makeStatefulElement((get) => toReactiveVirtualNode(view, get), options?.key))
    } else {
      this.storeNode(makeTemplate(view[template], view[templateProps], options?.key))
    }

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

export class HTMLVirtualTemplate<T> extends VirtualTemplate<T> {
  constructor(generator: (withProps: WithProps<T>) => HTMLView, protected props: T) {
    super()

    const builder = new HtmlViewBuilder()

    generator((handler) => {
      return (get) => {
        return handler(this.props, get)
      }
    })(builder as unknown as HTMLBuilder)

    this.virtualNode = builder.toVirtualNode()
  }
}


export function htmlTemplate<P = undefined>(definition: (withProps: WithProps<P>) => HTMLView): (...props: ViewProps<P>) => HTMLTemplateView<P> {
  let virtualTemplate: HTMLVirtualTemplate<P> | undefined

  return (...props: ViewProps<P>) => {
    const viewProps: any = props.length == 0 ? undefined : props[0]

    if (virtualTemplate === undefined) {
      virtualTemplate = new HTMLVirtualTemplate(definition, viewProps)
    }

    return {
      [template]: virtualTemplate,
      [templateProps]: viewProps
    }
  }
}