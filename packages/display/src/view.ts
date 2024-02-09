import { GetState, State, Stateful, Store } from "@spheres/store"
import { VirtualNode, makeBlockElement, makeStatefulTextNode, makeStatefulElement, makeVirtualElement, makeVirtualTextNode, setKey, virtualNodeConfig, addNamespace as setNamespace } from "./vdom/virtualNode.js"
import { InputElementAttributes, HTMLElements, HTMLBuilder } from "./htmlElements.js"
import { createStringRenderer } from "./vdom/renderToString.js"
import { createDOMRenderer } from "./vdom/renderToDom.js"
import { SVGBuilder, SVGElements, SvgElementAttributes } from "./svgElements.js"
import { BasicElementConfig, InputElementConfig, SpecialAttributes } from "./viewConfig.js"

// Renderers

export interface RenderResult {
  root: Node
  unmount: () => void
}

export function renderToDOM(store: Store, element: Element, view: View): RenderResult {
  const render = createDOMRenderer(store)
  const renderResult = render(element, view[toVirtualNode])

  return {
    root: renderResult.root,
    unmount: () => {
      renderResult.root.parentNode?.removeChild(renderResult.root)
    }
  }
}

export function renderToString(store: Store, view: View): string {
  const render = createStringRenderer(store)
  return render(view[toVirtualNode])
}


// View

const toVirtualNode = Symbol("toVirtualNode")

export interface View {
  [toVirtualNode]: VirtualNode
}

export interface ViewOptions {
  key?: string | number | State<any>
}

export interface SpecialElements {
  element(tag: string, builder?: (element: ConfigurableElement<SpecialAttributes, HTMLElements>) => void): this
  textNode(value: string | Stateful<string>): this
  zone(definition: View | ((get: GetState) => View), options?: ViewOptions): this
}

export interface SpecialElementBuilder {
  element(tag: string, builder?: (element: ConfigurableElement<SpecialAttributes, HTMLElements>) => void): View
  textNode(value: string | Stateful<string>): View
  zone(definition: View | ((get: GetState) => View), options?: ViewOptions): View
}

const configBuilder = new BasicElementConfig()
const inputConfigBuilder = new InputElementConfig()

export interface ConfigurableElement<A extends SpecialAttributes, B> {
  config: A
  children: B
}

const MagicElements = new Proxy({}, {
  get: (_, prop, receiver) => {
    return function (builder?: <A extends SpecialAttributes, B>(element: ConfigurableElement<A, B>) => void) {
      return receiver.buildElement(prop as string, builder)
    }
  }
})

class ViewBuilder {
  protected nodes: Array<VirtualNode> = []

  storeNode(node: VirtualNode) {
    this.nodes.push(node)
  }

  textNode(value: string | ((get: GetState) => string)) {
    if (typeof value === "function") {
      this.storeNode(makeStatefulTextNode(value))
    } else {
      this.storeNode(makeVirtualTextNode(value))
    }
    return this
  }

  zone(definition: View | ((get: GetState) => View), options?: ViewOptions) {
    let config = virtualNodeConfig()
    if (options?.key) {
      setKey(config, options.key)
    }

    if (typeof definition === "function") {
      this.storeNode(makeStatefulElement(config, (get) => definition(get)[toVirtualNode]))
    } else {
      this.storeNode(makeBlockElement(config, definition[toVirtualNode]))
    }

    return this
  }

  element(tag: string, builder?: (element: ConfigurableElement<SpecialAttributes, HTMLElements>) => void) {
    return this.buildElement(tag, builder)
  }

  buildElement(tag: string, builder?: (element: ConfigurableElement<any, any>) => void) {
    let storedNodes = this.nodes
    let childNodes: Array<VirtualNode> = []
    this.nodes = childNodes
    const config = virtualNodeConfig()
    configBuilder.resetConfig(config)
    builder?.({
      config: configBuilder,
      children: this
    })
    storedNodes.push(makeVirtualElement(tag, config, childNodes))
    this.nodes = storedNodes
    return this
  }

  svg(builder?: (element: ConfigurableElement<SvgElementAttributes, SVGElements>) => void) {
    const config = virtualNodeConfig()
    setNamespace(config, "http://www.w3.org/2000/svg")
    configBuilder.resetConfig(config)
    const view = new SVGViewBuilder()
    builder?.({
      config: configBuilder as unknown as SvgElementAttributes,
      children: view as unknown as SVGElements
    })
    this.storeNode(makeVirtualElement("svg", config, view.nodes))
    return this
  }

  input(builder?: (element: ConfigurableElement<InputElementAttributes, HTMLElements>) => void) {
    let storedNodes = this.nodes
    let childNodes: Array<VirtualNode> = []
    this.nodes = childNodes
    const config = virtualNodeConfig()
    inputConfigBuilder.resetConfig(config)
    builder?.({
      config: inputConfigBuilder as unknown as InputElementAttributes,
      children: this as unknown as HTMLElements
    })
    storedNodes.push(makeVirtualElement("input", config, childNodes))
    this.nodes = storedNodes
    return this
  }

  get [toVirtualNode](): VirtualNode {
    return this.nodes[0]
  }
}

Object.setPrototypeOf(Object.getPrototypeOf(new ViewBuilder()), MagicElements)

class HTMLView implements View {
  constructor (private definition: (builder: HTMLBuilder) => void) { }

  get [toVirtualNode](): VirtualNode {
    const builder = new ViewBuilder()
    this.definition(builder as unknown as HTMLBuilder)
    return builder[toVirtualNode]
  }
}


// SVG

class SVGViewBuilder extends ViewBuilder {
  buildElement(tag: string, builder: (element: ConfigurableElement<any, SVGElements>) => void) {
    let storedNodes = this.nodes
    let childNodes: Array<VirtualNode> = []
    this.nodes = childNodes
    const config = virtualNodeConfig()
    setNamespace(config, "http://www.w3.org/2000/svg")
    configBuilder.resetConfig(config)
    builder?.({
      config: configBuilder,
      children: this as unknown as SVGElements
    })
    storedNodes.push(makeVirtualElement(tag, config, childNodes))
    this.nodes = storedNodes
    return this
  }
}

class SVGView implements View {
  constructor (private definition: (builder: SVGBuilder) => void) { }

  get [toVirtualNode](): VirtualNode {
    const builder = new SVGViewBuilder()
    this.definition(builder as unknown as SVGBuilder)
    return builder[toVirtualNode]
  }
}

export function htmlView(definition: (builder: HTMLBuilder) => void): View {
  return new HTMLView(definition)
}

export function svgView(definition: (builder: SVGBuilder) => void): View {
  return new SVGView(definition)
}