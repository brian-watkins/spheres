import { GetState, State, Store, StoreMessage } from "state-party"
import { VirtualNode, VirtualNodeConfiguration, makeFragment, makeVirtualNode, makeVirtualTextNode } from "./vdom/virtualNode.js"
import { ViewElements, booleanAttributes } from "./htmlElements.js"
import { createStringRenderer } from "./vdom/renderToString.js"
import { createDOMRenderer } from "./vdom/renderToDom.js"

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
  return render(view[toVirtualNode]())
}

// Attributes

const getVirtualNodeConfiguration = Symbol("getVirtualNodeConfiguration")

export interface SpecialAttributes {
  key(value: string | number | State<any>): this
  classes(classes: Array<string>): this
  dataAttribute(name: string, value?: string): this
  property(name: string, value: string): this
  [getVirtualNodeConfiguration](): VirtualNodeConfiguration
}

class AttributesCollection implements SpecialAttributes {
  private config: VirtualNodeConfiguration = new VirtualNodeConfiguration()

  addAttribute(name: string, value: string) {
    if (name.startsWith("aria")) {
      this.config.addAttribute(`aria-${name.substring(4).toLowerCase()}`, value)
    } else {
      this.config.addAttribute(name, value)
    }
  }

  property(name: string, value: string): this {
    this.config.addProperty(name, value)
    return this
  }

  addEventHandler(name: string, handler: (evt: Event) => StoreMessage<any, any>) {
    this.config.setEventHandler(name, handler)
  }

  key(value: string | number | State<any, any>): this {
    this.config.setKey(`${value}`)
    return this
  }

  classes(classes: string[]): this {
    this.config.addClasses(classes)
    return this
  }

  dataAttribute(name: string, value: string = "true"): this {
    this.config.addAttribute(`data-${name}`, value)
    return this
  }

  booleanAttribute(name: string, isSelected: boolean) {
    if (isSelected) {
      this.addAttribute(name, name)
    }
  }

  [getVirtualNodeConfiguration](): VirtualNodeConfiguration {
    return this.config
  }
}

function makeElementConfig<A>(): A {
  return new Proxy(new AttributesCollection(), {
    get: (target, prop: string, receiver) => {
      if (Reflect.has(target, prop)) {
        return Reflect.get(target, prop, receiver)
      } else if (prop.startsWith("on")) {
        return (handler: <E extends Event>(evt: E) => StoreMessage<any>) => {
          const eventName = prop.substring(2).toLowerCase()
          target.addEventHandler(eventName, handler)
          return receiver
        }
      } else if (booleanAttributes.has(prop)) {
        return (value: boolean) => {
          target.booleanAttribute(prop, value)
          return receiver
        }
      } else {
        return (value: string) => {
          target.addAttribute(prop, value)
          return receiver
        }
      }
    }
  }) as A
}

// View

const toVirtualNode = Symbol("toVirtualNode")
const getVirtualNodes = Symbol("getVirtualNodes")

export interface View extends ViewElements {
  [toVirtualNode](): VirtualNode
  [getVirtualNodes](): Array<VirtualNode>
}

export interface StatefulConfig {
  key?: string | number | State<any>
  view: (get: GetState) => View
}

export interface SpecialElements {
  text(value: string): this
  withView(view: View): this
  withState(config: StatefulConfig): this
}

class BaseElementCollection implements SpecialElements {
  private nodes: Array<VirtualNode> = []

  text(value: string): this {
    this.nodes.push(makeVirtualTextNode(value))
    return this
  }

  withView(view: View): this {
    this.nodes.push(view[toVirtualNode]())
    return this
  }

  withState(statefulConfig: StatefulConfig): this {
    let config = new VirtualNodeConfiguration()
    config.setStatefulGenerator((get) => statefulConfig.view(get)[toVirtualNode]())
    if (statefulConfig.key) {
      config.setKey(`${statefulConfig.key}`)
    }
    const statefulNode = makeVirtualNode("view-with-state", config, [])
    this.nodes.push(statefulNode)

    return this
  }

  addElement(tag: string, builder?: <A extends SpecialAttributes>(element: ViewElement<A>) => void) {
    const element = new ViewElement(tag)
    builder?.(element)
    this.nodes.push(element[toVirtualNode]())
  }

  [toVirtualNode](): VirtualNode {
    if (this.nodes.length == 1) {
      return this.nodes[0]
    } else {
      return makeFragment(this.nodes)
    }
  }

  [getVirtualNodes](): Array<VirtualNode> {
    return this.nodes
  }
}

export function view(): View {
  return new Proxy(new BaseElementCollection(), {
    get: (target, prop, receiver) => {
      if (Reflect.has(target, prop)) {
        return Reflect.get(target, prop, receiver)
      } else {
        return (builder: <A extends SpecialAttributes>(element: ViewElement<A>) => void) => {
          target.addElement(prop as string, builder)
          return receiver
        }
      }
    }
  }) as unknown as View
}

export class ViewElement<A extends SpecialAttributes> {
  config = makeElementConfig<A>()
  private children = view()

  constructor(private tag?: string) { }

  get view(): ViewElements {
    return this.children
  }

  [toVirtualNode](): VirtualNode {
    return makeVirtualNode(this.tag, this.config[getVirtualNodeConfiguration](), this.children[getVirtualNodes]())
  }
}
