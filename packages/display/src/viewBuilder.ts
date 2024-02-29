import { State } from "@spheres/store"
import { BasicElementConfig, SpecialElementAttributes } from "./viewConfig"
import { Stateful, VirtualNode, makeStatefulTextNode, makeVirtualElement, makeVirtualTextNode, virtualNodeConfig } from "./vdom/virtualNode"
export type { Stateful } from "./vdom/virtualNode.js"

export interface ConfigurableElement<A extends SpecialElementAttributes<C>, B, C> {
  config: A
  children: B
}

export interface ViewOptions<T> {
  props?: T
  key?: string | number | State<any>
}

const templateNodeRegistry = new WeakMap<Function, VirtualNode>()

export abstract class ViewBuilder<A extends SpecialElementAttributes<C>, B, C> {
  nodes: Array<VirtualNode> = []

  storeNode(node: VirtualNode) {
    this.nodes.push(node)
  }

  protected getTemplateNode(key: Function): VirtualNode | undefined {
    return templateNodeRegistry.get(key)
  }

  protected setTemplateNode(key: Function, value: VirtualNode) {
    templateNodeRegistry.set(key, value)
  }

  textNode(value: string | Stateful<string, any>) {
    if (typeof value === "function") {
      this.storeNode(makeStatefulTextNode(value))
    } else {
      this.storeNode(makeVirtualTextNode(value))
    }
    return this
  }

  abstract element(tag: string, builder?: (element: ConfigurableElement<A, B, C>) => void): this

  protected buildElement(tag: string, configBuilder: BasicElementConfig, builder?: (element: ConfigurableElement<A, B, C>) => void) {
    let storedNodes = this.nodes
    let childNodes: Array<VirtualNode> = []
    this.nodes = childNodes
    const config = virtualNodeConfig()
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
    return function (builder?: <Context, A extends SpecialElementAttributes<Context>, B>(element: ConfigurableElement<A, B, Context>) => void) {
      return receiver.element(prop as string, builder)
    }
  }
})

Object.setPrototypeOf(ViewBuilder.prototype, MagicElements)
