import { GetState, Store } from "@spheres/store"
import { VirtualNode, makeStatefulElement, Stateful, makeTemplate, addStatefulProperty, addProperty, makeBlockElement, VirtualTemplate, WithProps } from "./vdom/virtualNode.js"
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
  view(builder as unknown as HTMLBuilder)
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
  view(builder as unknown as HTMLBuilder)
  return render(builder.toVirtualNode())
}


// View

export type HTMLView = (root: HTMLBuilder) => void

function toVirtualNode(generator: HTMLView): VirtualNode {
  const builder = new HtmlViewBuilder()
  generator(builder as unknown as HTMLBuilder)
  return builder.toVirtualNode()
}

function toReactiveVirtualNode(generator: (root: HTMLBuilder, get: GetState) => void, get: GetState): VirtualNode {
  const builder = new HtmlViewBuilder()
  generator(builder as unknown as HTMLBuilder, get)
  return builder.toVirtualNode()
}

export interface SpecialHTMLElements {
  element(tag: string, builder?: (element: ConfigurableElement<SpecialElementAttributes, HTMLElements>) => void): this
  textNode(value: string | Stateful<string>): this
  zone(definition: HTMLView, options?: ViewOptions): this
  zoneWithTemplate<T>(template: (root: HTMLBuilder, props: WithProps<T>) => void, props: T, options?: ViewOptions): this
  zoneWithState(generator: (root: HTMLBuilder, get: GetState) => void, options?: ViewOptions): this
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

class HtmlViewBuilder extends ViewBuilder<SpecialElementAttributes, HTMLElements> implements SpecialHTMLElements {
  zone(definition: HTMLView, options?: ViewOptions): this {
    this.storeNode(makeBlockElement(() => toVirtualNode(definition), options?.key))
    return this
  }

  zoneWithState(generator: (root: HTMLBuilder, get: GetState) => void, options?: ViewOptions): this {
    this.storeNode(makeStatefulElement((get) => toReactiveVirtualNode(generator, get), options?.key))
    return this
  }

  zoneWithTemplate<T>(template: (root: HTMLBuilder, props: WithProps<T>) => void, props: T, options?: ViewOptions): this {
    let virtualTemplate = this.getVirtualTemplate(template)
    if (virtualTemplate === undefined) {
      virtualTemplate = new HTMLVirtualTemplate(template, props)
      this.setVirtualTemplate(template, virtualTemplate)
    }
    this.storeNode(makeTemplate(virtualTemplate, props, options?.key))
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
  constructor(generator: (root: HTMLBuilder, withProps: WithProps<T>) => void, protected props: T) {
    super()

    const builder = new HtmlViewBuilder()

    generator(builder as unknown as HTMLBuilder, (handler) => {
      return (arg1, arg2) => {
        return handler(this.props, arg1, arg2)
      }
    })

    this.virtualNode = builder.toVirtualNode()
  }


}