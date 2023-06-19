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

const getVirtualNodeConfiguration = Symbol("getVirtualNodeConfiguration")

export interface SpecialAttributes {
  key(value: string | number | State<any>): this
  classes(classes: Array<string>): this
  dataAttribute(name: string, value?: string): this
  property(name: string, value: string): this
  [getVirtualNodeConfiguration]: VirtualNodeConfiguration
}

const configCore = {}

function makeElementConfig<A>(): A {
  const config: VirtualNodeConfiguration = new VirtualNodeConfiguration()

  return new Proxy(configCore, {
    get: (_, prop, receiver) => {
      switch (prop) {
        case "property":
          return function (name: string, value: string) {
            config.addProperty(name, value)
            return receiver
          }
        case "key":
          return function(value: string | number | State<any, any>) {
            config.setKey(`${value}`)
            return receiver
          }
        case "classes":
          return function(classes: string[]) {
            config.addClasses(classes)
            return receiver
          }
        case "dataAttribute":
          return function(name: string, value: string = "true") {
            config.addAttribute(`data-${name}`, value)
            return receiver
          }
        case getVirtualNodeConfiguration:
          return config
        default:
          const methodName = prop as string
          if (methodName.startsWith("on")) {
            return function(handler: <E extends Event>(evt: E) => StoreMessage<any>) {
              const eventName = methodName.substring(2).toLowerCase()
              config.setEventHandler(eventName, handler)
              return receiver
            }
          } else if (booleanAttributes.has(methodName)) {
            return function(isSelected: boolean) {
              if (isSelected) {
                config.addAttribute(methodName, methodName)
              }
              return receiver
            }
          } else {
            return function (value: string) {
              if (methodName.startsWith("aria")) {
                config.addAttribute(`aria-${methodName.substring(4).toLowerCase()}`, value)
              } else {
                config.addAttribute(methodName, value)
              }
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
  [toVirtualNode]: VirtualNode
  [getVirtualNodes]: Array<VirtualNode>
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

const coreView = {}

export function view(): View {
  let nodes: Array<VirtualNode> = []

  return new Proxy(coreView, {
    get: (_, prop, receiver) => {
      switch (prop) {
        case "text":
          return function (value: string) {
            nodes.push(makeVirtualTextNode(value))
            return receiver
          }
        case "withView":
          return function (view: View) {
            nodes.push(view[toVirtualNode])
            return receiver
          }
        case "withState":
          return function (statefulConfig: StatefulConfig) {
            let config = new VirtualNodeConfiguration()
            config.setStatefulGenerator((get) => statefulConfig.view(get)[toVirtualNode])
            if (statefulConfig.key) {
              config.setKey(`${statefulConfig.key}`)
            }
            nodes.push(makeVirtualNode("view-with-state", config, []))
            return receiver
          }
        case toVirtualNode:
          if (nodes.length == 1) {
            return nodes[0]
          } else {
            return makeFragment(nodes)
          }
        case getVirtualNodes:
          return nodes
        default:
          return function (builder?: <A extends SpecialAttributes>(element: ViewElement<A>) => void) {
            const element = new ViewElement(prop as string)
            builder?.(element)
            nodes.push(element[toVirtualNode])
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

  get [toVirtualNode](): VirtualNode {
    return makeVirtualNode(this.tag, this.config[getVirtualNodeConfiguration], this.children[getVirtualNodes])
  }
}
