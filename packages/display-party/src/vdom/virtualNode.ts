import { Attrs, Hooks, On, Props, VNode } from "snabbdom";
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
export interface VirtualNodeConfig {
  props?: Props;
  attrs?: Attrs;
  on?: On;
  hook?: Hooks & { render?: (store: Store, vnode: VirtualNode) => Promise<VirtualNode> };
  key?: string;
  storeContext?: StoreContext
}

export interface StoreContext {
  generator: (get: GetState) => VirtualNode
  template?: string
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

export function setEventHandler(config: VirtualNodeConfig, event: string, handler: (evt: Event) => StoreMessage<any, any>) {
  config.on![event] = function <E extends Event>(evt: E) {
    evt.target?.dispatchEvent(new CustomEvent("displayMessage", {
      bubbles: true,
      cancelable: true,
      detail: handler(evt)
    }))
  }
}

export function setStatefulGenerator(config: VirtualNodeConfig, generator: (get: GetState) => VirtualNode, template?: string) {
  config.storeContext = {
    generator,
    template
  }
}

export function makeVirtualNode(tag: string | undefined, config: VirtualNodeConfig, children: Array<VirtualNode>): VirtualNode {
  // See Snabbdom src/h.ts and src/vnode.ts
  // We are not supporting SVG at the moment but otherwise this should work
  return {
    sel: tag,
    data: config,
    children,
    text: undefined,
    elm: undefined,
    key: config.key
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
  return makeVirtualNode(undefined, virtualNodeConfig(), children)
}
