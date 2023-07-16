import { GetState, State, Store } from "state-party"
import { VirtualNode, VirtualNodeConfig, addAttribute, addClasses, addProperty, makeFragment, makeVirtualNode, makeVirtualTextNode, setEventHandler, setKey, setStatefulGenerator, virtualNodeConfig } from "./vdom/virtualNode.js"
import { AriaAttributes, ElementEvents, ViewElements, booleanAttributes } from "./htmlElements.js"
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
      switch (renderResult.type) {
        case "element-root":
          renderResult.root.parentNode?.removeChild(renderResult.root)
          break
        case "fragment-root":
          while (renderResult.root.hasChildNodes()) {
            renderResult.root.lastChild?.remove()
          }
          break
      }
    }
  }
}

export function renderToString(store: Store, view: View): Promise<string> {
  const render = createStringRenderer(store)
  return render(view[toVirtualNode])
}

// Attributes

const resetConfig = Symbol("reset-config")

export interface SpecialAttributes {
  key(value: string | number | State<any>): this
  classes(classes: Array<string>): this
  dataAttribute(name: string, value?: string): this
  property(name: string, value: string): this
  on(events: ElementEvents): this
  aria(attributes: AriaAttributes): this
}

class BasicConfig implements SpecialAttributes {
  private config: VirtualNodeConfig = virtualNodeConfig()

  key(value: string | number | State<any, any>) {
    setKey(this.config, `${value}`)
    return this
  }

  property(name: string, value: string) {
    addProperty(this.config, name, value)
    return this
  }

  classes(classes: string[]) {
    addClasses(this.config, classes)
    return this
  }

  dataAttribute(name: string, value: string = "true") {
    addAttribute(this.config, `data-${name}`, value)
    return this
  }

  aria(attributes: AriaAttributes) {
    const entries = Object.entries(attributes)
    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i]
      addAttribute(this.config, `aria-${key}`, value)
    }
    return this
  }

  on(events: ElementEvents) {
    const entries = Object.entries(events)
    for (let i = 0; i < entries.length; i++) {
      const [event, handler] = entries[i]
      setEventHandler(this.config, event, handler)
    }
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
      return function (isSelected: boolean) {
        if (isSelected) {
          addAttribute(receiver.config, methodName, methodName)
        }
        return receiver
      }
    } else {
      return function (value: string) {
        addAttribute(receiver.config, methodName, value)
        return receiver
      }
    }
  }
})

Object.setPrototypeOf(Object.getPrototypeOf(new BasicConfig()), MagicConfig)

// View

const toVirtualNode = Symbol("toVirtualNode")

export interface View extends ViewElements {
  [toVirtualNode]: VirtualNode
}

export interface StatefulConfig {
  key?: string | number | State<any>
  view: (get: GetState) => View
  template?: string
}

export interface SpecialElements {
  text(value: string): this
  withView(view: View): this
  withState(config: StatefulConfig): this
}

const configBuilder = new BasicConfig()

export interface ViewElement<A extends SpecialAttributes> {
  config: A
  view: ViewElements
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
        view: receiver
      })
      storedNodes.push(makeVirtualNode(prop as string, config, childNodes))
      receiver.nodes = storedNodes
      return receiver
    }
  }
})

class BasicView implements SpecialElements {
  private nodes: Array<VirtualNode> = []

  text(value: string) {
    this.nodes.push(makeVirtualTextNode(value))
    return this
  }

  withView(view: View) {
    this.nodes.push(view[toVirtualNode])
    return this
  }

  withState(statefulConfig: StatefulConfig) {
    let config = virtualNodeConfig()
    setStatefulGenerator(config, (get) => statefulConfig.view(get)[toVirtualNode], statefulConfig.template)
    if (statefulConfig.key) {
      setKey(config, `${statefulConfig.key}`)
    }
    this.nodes.push(makeVirtualNode("vws", config, []))
    return this
  }

  get [toVirtualNode]() {
    if (this.nodes.length == 1) {
      return this.nodes[0]
    } else {
      return makeFragment(this.nodes)
    }
  }
}

Object.setPrototypeOf(Object.getPrototypeOf(new BasicView()), MagicElements)

export function view(): View {
  return new BasicView() as unknown as View
}
