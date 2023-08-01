// import { Attrs, Hooks, On, Props, VNode } from "snabbdom";
import { GetState, StoreMessage } from "state-party";

export enum NodeType {
  TEXT = 3,
  ELEMENT = 1,
  STATEFUL = 15
}

export interface TextNode {
  type: NodeType.TEXT
  value: string
  node: Node | undefined
}

export interface ElementNode {
  type: NodeType.ELEMENT
  is: string | undefined
  tag: string
  data: VirtualNodeConfig
  children: Array<VirtualNode>
  node: Node | undefined
  key: string | undefined
}

export interface StatefulNode {
  type: NodeType.STATEFUL
  key: string | undefined
  generator: (get: GetState) => VirtualNode
  node: Node | undefined
  unsubscribe?: () => void
}

export type VirtualNode = TextNode | ElementNode | StatefulNode

// Tailored from Snabbdom VNode
// export interface VirtualNode {
//   tag: string | undefined;
//   type: NodeType
//   data: VirtualNodeConfig | undefined;
//   children: Array<VirtualNode> | undefined;
//   elm: Node | undefined;
//   text: string | undefined;
//   key: string | undefined;
// }

declare type Listener = (ev: Event) => any;

export interface VirtualNodeConfig {
  props: Record<string, any>
  attrs: Record<string, string>
  // on: {
  //   [N in keyof HTMLElementEventMap]?: Listener<HTMLElementEventMap[N]> | Array<Listener<HTMLElementEventMap[N]>>;
  // } & {
  //   [event: string]: Listener<any> | Array<Listener<any>>;
  // }
  on: { [N in keyof HTMLElementEventMap]?: Listener }
  key?: string
}

// Tailored from Snabbdom VNodeData
// export interface VirtualNodeConfig {
//   props?: Props;
//   attrs?: Attrs;
//   on?: On;
//   hook?: Hooks & { render?: (store: Store, vnode: VirtualNode) => Promise<VirtualNode> };
//   key?: string;
//   storeContext?: StoreContext
// }

export interface StoreContext {
  generator: (get: GetState) => VirtualNode
}

export function virtualNodeConfig(): VirtualNodeConfig {
  return {
    props: {},
    attrs: {},
    on: {}
  }
}

export function addProperty(config: VirtualNodeConfig, name: string, value: string) {
  config.props![name] = value
}

export function addAttribute(config: VirtualNodeConfig, name: string, value: string) {
  config.attrs![name] = value
}

export function setKey(config: VirtualNodeConfig, key: string) {
  config.key = key
}

export function addClasses(config: VirtualNodeConfig, classNames: Array<string>) {
  addAttribute(config, "class", classNames.join(" "))
}

export function setEventHandler<N extends keyof HTMLElementEventMap>(config: VirtualNodeConfig, event: N, handler: (evt: HTMLElementEventMap[N]) => StoreMessage<any, any>) {
  config.on = Object.assign(config.on, {
    [event]: (evt: HTMLElementEventMap[N]) => {
      evt.target?.dispatchEvent(new CustomEvent("displayMessage", {
        bubbles: true,
        cancelable: true,
        detail: handler(evt)
      }))
    }
  })
}

export function makeStatefulElement(config: VirtualNodeConfig, generator: (get: GetState) => VirtualNode, node?: Node): VirtualNode {
  return {
    type: NodeType.STATEFUL,
    key: config.key,
    generator,
    node
  }
}

// export function setStatefulGenerator(config: VirtualNodeConfig, generator: (get: GetState) => VirtualNode) {
//   // config.storeContext = {
//   // generator
//   // }
// }

export function makeVirtualElement(tag: string, config: VirtualNodeConfig, children: Array<VirtualNode>, node?: Node): ElementNode {
  // See Snabbdom src/h.ts and src/vnode.ts
  // We are not supporting SVG at the moment but otherwise this should work
  return {
    type: NodeType.ELEMENT,
    tag: tag,
    is: config.attrs.is,
    data: config,
    children,
    key: config.key,
    node
  }
}

export function makeVirtualTextNode(text: string, node?: Node): TextNode {
  // See Snabbdom src/h.ts and src/vnode.ts
  // This can be a discriminated union now I think ...
  return {
    type: NodeType.TEXT,
    value: text,
    node
  }
}

// export function makeVirtualFragment(children: Array<VirtualNode>): VirtualNode {
//   // following Snabbdom src/h.ts
//   // return makeVirtualNode(undefined, virtualNodeConfig(), children)
//   return {
//     type: NodeType.FRAGMENT,
//     data: virtualNodeConfig(), // Do we need this?
//     children,
//     node: undefined
//   }
// }
