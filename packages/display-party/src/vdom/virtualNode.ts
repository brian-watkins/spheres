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
  // store?: Store
  generator: (get: GetState) => VirtualNode
  unsubscribe?: () => void
}

export class Property {
  type: "property" = "property"

  constructor(public key: string, public value: string) { }
}

export class Attribute {
  type: "attribute" = "attribute"

  constructor(public key: string, public value: string) { }
}

export class Key {
  type: "key" = "key"

  constructor(public key: string) { }
}

export type CssClassname = string

export class CssClasses {
  type: "css-classes" = "css-classes"

  constructor(public classObject: { [key: CssClassname]: boolean }) { }
}

export class EventHandler {
  type: "event" = "event"

  constructor(public event: string, public generator: (evt: Event) => StoreMessage<any, any>) { }
}

export class StatefulGenerator {
  type: "stateful" = "stateful"

  constructor(public generator: (get: GetState) => VirtualNode) { }
}

export type VirtualNodeAttribute = Property | Attribute | EventHandler | CssClasses | Key | StatefulGenerator

export function makeVirtualNodeConfig(attributes: Array<VirtualNodeAttribute>): VirtualNodeConfig {
  const dict: any = {
    props: {},
    attrs: {},
    class: {},
    on: {}
  }
  for (const attr of attributes) {
    switch (attr.type) {
      case "property":
        dict.props[attr.key] = attr.value
        break
      case "attribute":
        dict.attrs[attr.key] = attr.value
        break
      case "css-classes":
        dict.class = Object.assign(dict.class, attr.classObject)
        break
      case "event":
        dict.on[attr.event] = function <E extends Event>(evt: E) {
          evt.target?.dispatchEvent(new CustomEvent("displayMessage", {
            bubbles: true,
            cancelable: true,
            detail: attr.generator(evt)
          }))
        }
        break
      case "key":
        dict.key = attr.key
        break
      case "stateful":
        dict.storeContext = {
          generator: attr.generator
        }
        break
      default:
        exhaustiveMatchGuard(attr)
    }
  }
  return dict
}

function exhaustiveMatchGuard(_: never) {
  throw new Error("Should never get here!")
}

export function makeVirtualNode(tag: string | undefined, attributes: Array<VirtualNodeAttribute>, children: Array<VirtualNode>): VirtualNode {
  // See Snabbdom src/h.ts and src/vnode.ts
  // We are not supporting SVG at the moment but otherwise this should work
  const config = makeVirtualNodeConfig(attributes)
  return {
    sel: tag,
    data: config,
    children,
    text: undefined,
    elm: undefined,
    key: config?.key
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
  return makeVirtualNode(undefined, [], children)
}
