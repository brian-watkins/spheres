import { GetState, State, Store } from "@spheres/store"
import { VirtualNode, makeBlockElement, makeStatefulTextNode, makeStatefulElement, makeVirtualElement, makeVirtualTextNode, setKey, virtualNodeConfig, addNamespace as setNamespace, Stateful, makeTemplate } from "./vdom/virtualNode.js"
import { InputElementAttributes, HTMLElements, HTMLBuilder } from "./htmlElements.js"
import { createStringRenderer } from "./vdom/renderToString.js"
import { createDOMRenderer } from "./vdom/renderToDom.js"
import { SVGBuilder, SVGElements, SvgElementAttributes } from "./svgElements.js"
import { BasicElementConfig, InputElementConfig, SVGElementConfig, SpecialAttributes } from "./viewConfig.js"
export type { Stateful } from "./vdom/virtualNode.js"

// Renderers

export interface RenderResult {
  root: Node
  unmount: () => void
}

export function renderToDOM(store: Store, element: Element, view: View): RenderResult {
  const render = createDOMRenderer(store)
  const renderResult = render(element, view[toVirtualNode]())

  return {
    root: renderResult.root,
    unmount: () => {
      renderResult.root.parentNode?.removeChild(renderResult.root)
    }
  }
}

export function renderToString(store: Store, view: View): string {
  const render = createStringRenderer(store)
  return render(view[toVirtualNode]())
}


// View

const toVirtualNode = Symbol("toVirtualNode")

export interface View {
  [toVirtualNode](): VirtualNode
}

export interface ViewOptions {
  key?: string | number | State<any>
}

export interface SpecialElements<Context> {
  element(tag: string, builder?: (element: ConfigurableElement<SpecialAttributes<Context>, HTMLElements<Context>, Context>) => void): this
  textNode(value: string | Stateful<string, Context>): this
  zone(definition: View | ((get: GetState, context: Context) => View), options?: ViewOptions): this
}

export interface SpecialElementBuilder<Context> {
  element(tag: string, builder?: (element: ConfigurableElement<SpecialAttributes<Context>, HTMLElements<Context>, Context>) => void): View
  textNode(value: string | Stateful<string>): View
  zone(definition: View | ((get: GetState) => View), options?: ViewOptions): View
}

const configBuilder = new BasicElementConfig()
const svgConfigBuilder = new SVGElementConfig()
const inputConfigBuilder = new InputElementConfig()

export interface ConfigurableElement<A extends SpecialAttributes<C>, B, C> {
  config: A
  children: B
}

const MagicElements = new Proxy({}, {
  get: (_, prop, receiver) => {
    return function (builder?: <Context, A extends SpecialAttributes<Context>, B>(element: ConfigurableElement<A, B, Context>) => void) {
      return receiver.buildElement(prop as string, builder)
    }
  }
})

class ViewBuilder {
  protected nodes: Array<VirtualNode> = []

  // we could keep a flag here like 'containsZone' or something?

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

  zone(definition: View | ((get: GetState, context: any) => View), options?: ViewOptions) {
    let config = virtualNodeConfig()
    if (options?.key) {
      setKey(config, options.key)
    }

    if (typeof definition === "function") {
      this.storeNode(makeStatefulElement(config, (get, context) => definition(get, context)[toVirtualNode]()))
    } else {
      this.storeNode(makeBlockElement(config, () => definition[toVirtualNode]()))
    }

    return this
  }

  element(tag: string, builder?: (element: ConfigurableElement<SpecialAttributes<any>, HTMLElements<any>, any>) => void) {
    return this.buildElement(tag, builder)
  }

  buildElement(tag: string, builder?: (element: ConfigurableElement<any, any, any>) => void) {
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

  svg(builder?: (element: ConfigurableElement<SvgElementAttributes<any>, SVGElements<any>, any>) => void) {
    const config = virtualNodeConfig()
    setNamespace(config, "http://www.w3.org/2000/svg")
    svgConfigBuilder.resetConfig(config)
    const view = new SVGViewBuilder()
    builder?.({
      config: svgConfigBuilder as unknown as SvgElementAttributes<any>,
      children: view as unknown as SVGElements<any>
    })
    this.storeNode(makeVirtualElement("svg", config, view.nodes))
    return this
  }

  input(builder?: (element: ConfigurableElement<InputElementAttributes<any>, HTMLElements<any>, any>) => void) {
    let storedNodes = this.nodes
    let childNodes: Array<VirtualNode> = []
    this.nodes = childNodes
    const config = virtualNodeConfig()
    inputConfigBuilder.resetConfig(config)
    builder?.({
      config: inputConfigBuilder as unknown as InputElementAttributes<any>,
      children: this as unknown as HTMLElements<any>
    })
    storedNodes.push(makeVirtualElement("input", config, childNodes))
    this.nodes = storedNodes
    return this
  }

  [toVirtualNode](): VirtualNode {
    return this.nodes[0]
  }
}

Object.setPrototypeOf(Object.getPrototypeOf(new ViewBuilder()), MagicElements)

class HTMLView<C> implements View {
  constructor(private definition: (builder: HTMLBuilder<C>) => void) { }

  [toVirtualNode](): VirtualNode {
    const builder = new ViewBuilder()
    this.definition(builder as unknown as HTMLBuilder<C>)
    return builder[toVirtualNode]()
  }
}


// SVG

class SVGViewBuilder extends ViewBuilder {
  buildElement(tag: string, builder: (element: ConfigurableElement<any, SVGElements<any>, any>) => void) {
    let storedNodes = this.nodes
    let childNodes: Array<VirtualNode> = []
    this.nodes = childNodes
    const config = virtualNodeConfig()
    setNamespace(config, "http://www.w3.org/2000/svg")
    svgConfigBuilder.resetConfig(config)
    builder?.({
      config: svgConfigBuilder,
      children: this as unknown as SVGElements<any>
    })
    storedNodes.push(makeVirtualElement(tag, config, childNodes))
    this.nodes = storedNodes
    return this
  }
}

class SVGView<C> implements View {
  constructor(private definition: (builder: SVGBuilder<C>) => void) { }

  [toVirtualNode](): VirtualNode {
    const builder = new SVGViewBuilder()
    this.definition(builder as unknown as SVGBuilder<C>)
    return builder[toVirtualNode]()
  }
}

export function htmlView(definition: (builder: HTMLBuilder<undefined>) => void): View {
  return new HTMLView(definition)
}

export function svgView(definition: (builder: SVGBuilder<undefined>) => void): View {
  return new SVGView(definition)
}

// Template


export function htmlTemplate<T>(definition: (builder: HTMLBuilder<T>) => void): (context: T) => View {
  let vnode: VirtualNode | undefined

  return (context) => {
    return {
      [toVirtualNode]() {
        if (vnode === undefined) {
          const builder = new ViewBuilder()
          definition(builder as unknown as HTMLBuilder<T>)
          vnode = builder[toVirtualNode]()
        }

        return makeTemplate(vnode, context)
      }
    }
  }
}