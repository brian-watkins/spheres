import { GetState, State, Stateful, Store } from "state-party"
import { VirtualNode, VirtualNodeConfig, addAttribute, addProperty, addStatefulAttribute, makeBlockElement, makeReactiveTextNode, makeStatefulElement, makeVirtualElement, makeVirtualTextNode, setEventHandler, setKey, virtualNodeConfig } from "./vdom/virtualNode.js"
import { ViewBuilder, AriaAttributes, ElementEvents, booleanAttributes, ViewElements } from "./htmlElements.js"
import { createStringRenderer } from "./vdom/renderToString.js"
import { createDOMRenderer } from "./vdom/renderToDom.js"

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

// Attributes

const resetConfig = Symbol("reset-config")

export interface SpecialAttributes {
  dataAttribute(name: string, value?: string): this
  innerHTML(html: string): this
  on(events: ElementEvents): this
  aria(attributes: AriaAttributes): this
}

class BasicConfig implements SpecialAttributes {
  private config: VirtualNodeConfig = virtualNodeConfig()

  innerHTML(html: string): this {
    addProperty(this.config, "innerHTML", html)
    return this
  }

  dataAttribute(name: string, value: string = "true") {
    addAttribute(this.config, `data-${name}`, value)
    return this
  }

  aria(attributes: AriaAttributes) {
    for (let name in attributes) {
      //@ts-ignore
      addAttribute(this.config, `aria-${name}`, attributes[name])
    }
    return this
  }

  on(events: ElementEvents) {
    for (let name in events) {
      //@ts-ignore
      setEventHandler(this.config, name, events[name])
    }
    return this
  }

  value(val: string) {
    addProperty(this.config, "value", val)
    addAttribute(this.config, "value", val)
    return this
  }

  [resetConfig](config: VirtualNodeConfig) {
    this.config = config
  }
}

const MagicConfig = new Proxy({}, {
  get: (_, prop, receiver) => {
    const methodName = prop as string
    if (booleanAttributes.has(methodName)) {
      return function (isSelected: boolean | Stateful<boolean>) {
        if (typeof isSelected === "function") {
          addStatefulAttribute(receiver.config, methodName, (get) => isSelected(get) ? methodName : null)
        } else {
          if (isSelected) {
            addAttribute(receiver.config, methodName, methodName)
          }
        }
        return receiver
      }
    } else {
      return function (value: string | Stateful<string>) {
        if (typeof value === "function") {
          addStatefulAttribute(receiver.config, methodName, value)
        } else {
          addAttribute(receiver.config, methodName, value)
        }
        return receiver
      }
    }
  }
})

Object.setPrototypeOf(Object.getPrototypeOf(new BasicConfig()), MagicConfig)

// View

const toVirtualNode = Symbol("toVirtualNode")

export interface View {
  [toVirtualNode]: VirtualNode
}

export interface ViewOptions {
  key?: string | number | State<any>
}

export interface SpecialElements {
  text(value: string | Stateful<string>): this
  view(definition: (() => View) | ((get: GetState) => View), options?: ViewOptions): this
}

export interface SpecialElementBuilder {
  text(value: string): View
  view(definition: (() => View) | ((get: GetState) => View), options?: ViewOptions): View
}

const configBuilder = new BasicConfig()

export interface ViewElement<A extends SpecialAttributes> {
  config: A
  children: ViewElements
}

const MagicElements = new Proxy({}, {
  get: (_, prop, receiver) => {
    return function (builder?: <A extends SpecialAttributes>(element: ViewElement<A>) => void) {
      let storedNodes = receiver.nodes
      let childNodes: Array<VirtualNode> = []
      receiver.nodes = childNodes
      const config = virtualNodeConfig()
      configBuilder[resetConfig](config)
      builder?.({
        config: configBuilder,
        children: receiver
      })
      storedNodes.push(makeVirtualElement(prop as string, config, childNodes))
      receiver.nodes = storedNodes
      return receiver
    }
  }
})

class BasicView implements SpecialElements, SpecialElementBuilder {
  private nodes: Array<VirtualNode> = []

  text(value: string | ((get: GetState) => string)) {
    if (typeof value === "function") {
      this.nodes.push(makeReactiveTextNode(value))
    } else {
      this.nodes.push(makeVirtualTextNode(value))
    }
    return this
  }

  view(definition: (() => View) | ((get: GetState) => View), options?: ViewOptions) {
    let config = virtualNodeConfig()
    if (options?.key) {
      setKey(config, options.key)
    }

    const element = definition.length === 0 ?
      //@ts-ignore
      makeBlockElement(config, () => definition()[toVirtualNode]) :
      makeStatefulElement(config, (get) => definition(get)[toVirtualNode])
    this.nodes.push(element)

    return this
  }

  get [toVirtualNode]() {
    return this.nodes[0]
  }
}

Object.setPrototypeOf(Object.getPrototypeOf(new BasicView()), MagicElements)

export function view(): ViewBuilder {
  return new BasicView() as unknown as ViewBuilder
}
