import { State } from "../store/index.js"
import { BasicElementConfig, SpecialElementAttributes } from "./viewConfig.js"
import { Stateful, VirtualNode, VirtualTemplate, makeStatefulTextNode, makeVirtualElement, makeVirtualTextNode, virtualNodeConfig } from "./vdom/virtualNode.js"
export type { Stateful } from "./vdom/virtualNode.js"

export interface ConfigurableElement<A extends SpecialElementAttributes, B> {
  config: A
  children: B
}

export interface ViewOptions {
  key?: string | number | State<any>
}

export type ViewArgs<P> = P extends undefined ? [] : [P]

const templateNodeRegistry = new WeakMap<Function, VirtualTemplate<any>>()

class Sequence {
  private val: number = 0

  next(): number {
    return this.val++
  }
}

export abstract class ViewBuilder<A extends SpecialElementAttributes, B> {
  nodes: Array<VirtualNode> = []
  eventId: Sequence = new Sequence()

  storeNode(node: VirtualNode) {
    this.nodes.push(node)
  }

  protected getVirtualTemplate(key: Function): VirtualTemplate<any> | undefined {
    return templateNodeRegistry.get(key)
  }

  protected setVirtualTemplate(key: Function, value: VirtualTemplate<any>) {
    templateNodeRegistry.set(key, value)
  }

  textNode(value: string | Stateful<string>) {
    if (typeof value === "function") {
      this.storeNode(makeStatefulTextNode(value))
    } else {
      this.storeNode(makeVirtualTextNode(value))
    }
    return this
  }

  abstract element(tag: string, builder?: (element: ConfigurableElement<A, B>) => void): this

  protected buildElement(tag: string, configBuilder: BasicElementConfig, builder?: (element: ConfigurableElement<A, B>) => void) {
    let storedNodes = this.nodes
    let childNodes: Array<VirtualNode> = []
    this.nodes = childNodes
    const config = virtualNodeConfig(this.eventId.next())
    configBuilder.resetConfig(config)
    builder?.({
      config: configBuilder as unknown as A,
      children: this as unknown as B
    })
    storedNodes.push(makeVirtualElement(tag, config, childNodes))
    this.nodes = storedNodes
    return this
  }
  
  toVirtualNode(): VirtualNode {
    return this.nodes[0]
  }
}

const MagicElements = new Proxy({}, {
  get: (_, prop, receiver) => {
    return function (builder?: <A extends SpecialElementAttributes, B>(element: ConfigurableElement<A, B>) => void) {
      return receiver.element(prop as string, builder)
    }
  }
})

Object.setPrototypeOf(ViewBuilder.prototype, MagicElements)
