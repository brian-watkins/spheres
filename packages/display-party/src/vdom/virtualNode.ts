import { Attrs, Classes, Hooks, On, Props, VNode } from "snabbdom";
import { GetState, Store, StoreMessage } from "state-party";

// Tailored from Snabbdom VNode
export interface VirtualNode extends VNode {
  sel: string | undefined;
  data: VirtualNodeConfig | undefined;
  children: Array<VirtualNode> | undefined;
  elm: Node | undefined;
  text: string | undefined;
  key: string | undefined;
}

// Tailored from Snabbdom VNodeData
interface VirtualNodeConfig {
  props?: Props;
  attrs?: Attrs;
  class?: Classes;
  on?: On;
  hook?: Hooks & { render?: (store: Store, vnode: VirtualNode) => Promise<VirtualNode> };
  key?: string;
  storeContext?: StoreContext
}

export interface StoreContext {
  generator: (get: GetState) => VirtualNode
  unsubscribe?: () => void
}

export class VirtualNodeConfiguration {
  private config: VirtualNodeConfig = {
    props: {},
    attrs: {},
    class: {},
    on: {}
  }

  get data(): VirtualNodeConfig {
    return this.config
  }
  
  addProperty(name: string, value: string) {
    this.config.props![name] = value
  }
  
  addAttribute(name: string, value: string) {
    this.config.attrs![name] = value
  }

  setKey(key: string) {
    this.config.key = key
  }

  addClasses(classNames: Array<string>) {
    const classObject = Object.fromEntries(classNames.map(name => [name, true]))
    this.config.class = Object.assign(this.config.class!, classObject)
  }

  setEventHandler(event: string, handler: (evt: Event) => StoreMessage<any, any>) {
    this.config.on![event] = function <E extends Event>(evt: E) {
      evt.target?.dispatchEvent(new CustomEvent("displayMessage", {
        bubbles: true,
        cancelable: true,
        detail: handler(evt)
      }))
    }
  }

  setStatefulGenerator(generator: (get: GetState) => VirtualNode) {
    this.config.storeContext = {
      generator
    }
  }
}

export function makeVirtualNode(tag: string | undefined, config: VirtualNodeConfiguration, children: Array<VirtualNode>): VirtualNode {
  // See Snabbdom src/h.ts and src/vnode.ts
  // We are not supporting SVG at the moment but otherwise this should work
  return {
    sel: tag,
    data: config.data,
    children,
    text: undefined,
    elm: undefined,
    key: config.data.key
  }
}

export function makeVirtualTextNode(text: string): VirtualNode {
  // See Snabbdom src/h.ts and src/vnode.ts
  return {
    sel: undefined,
    data: undefined,
    children: undefined,
    text,
    elm: undefined,
    key: undefined
  }
}

export function makeFragment(children: Array<VirtualNode>): VirtualNode {
  // following Snabbdom src/h.ts
  return makeVirtualNode(undefined, new VirtualNodeConfiguration(), children)
}
