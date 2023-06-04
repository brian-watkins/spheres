import { GetState, State, Store, StoreMessage } from "state-party"
import { EventHandler, Attribute, CssClasses, CssClassname, VirtualNode, VirtualNodeAttribute, makeFragment, makeVirtualNode, makeVirtualTextNode, makeStatefulVirtualNode, createDOMRenderer, Key, Property } from "./vdom.js"
import { ViewElements, booleanAttributes } from "./htmlElements.js"
import { createStringRenderer } from "./render.js"

// Renderers

export function renderToDOM(store: Store, element: Element, view: View): Element {
  const render = createDOMRenderer(store)
  return render(element, view[toVirtualNode]())
}

export function renderToString(store: Store, view: View): Promise<string> {
  const render = createStringRenderer(store)
  return render(view[toVirtualNode]())
}

// Attributes

const getVirtualNodeAttributes = Symbol("getAllAttributes")

export interface SpecialAttributes {
  key(value: string | number | State<any>): this
  classes(classes: Array<string>): this
  dataAttribute(name: string, value?: string): this
  property(name: string, value: string): this
  [getVirtualNodeAttributes](): Array<VirtualNodeAttribute>
}

class AttributesCollection implements SpecialAttributes {
  attributes: Array<VirtualNodeAttribute> = []

  addAttribute(name: string, value: string) {
    this.attributes.push(new Attribute(name, value))
  }

  property(name: string, value: string): this {
    this.attributes.push(new Property(name, value))
    return this
  }

  addEventHandler(name: string, handler: (evt: Event) => StoreMessage<any, any>) {
    this.attributes.push(new EventHandler(name, handler))
  }

  key(value: string | number | State<any, any>): this {
    this.attributes.push(new Key(`${value}`))
    return this
  }

  classes(classes: string[]): this {
    const classObject: { [key: CssClassname]: boolean } = {}
    for (const classname of classes) {
      classObject[classname] = true
    }

    this.attributes.push(new CssClasses(classObject))
    return this
  }

  dataAttribute(name: string, value: string = "true"): this {
    this.attributes.push(new Attribute(`data-${name}`, value))
    return this
  }

  booleanAttribute(name: string, isSelected: boolean) {
    if (isSelected) {
      this.addAttribute(name, name)
    }
  }

  [getVirtualNodeAttributes](): VirtualNodeAttribute[] {
    return this.attributes
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
      } else {
        if (booleanAttributes.has(prop)) {
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

export interface SpecialElements {
  text(value: string): this
  withView(view: View): this
  withState(generator: (get: GetState) => View): this
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

  withState(definition: (get: GetState) => View): this {
    const node = makeStatefulVirtualNode("view-with-state", (get) => definition(get)[toVirtualNode]())
    this.nodes.push(node)

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
    return makeVirtualNode(this.tag, this.config[getVirtualNodeAttributes](), this.children[getVirtualNodes]())
  }
}
