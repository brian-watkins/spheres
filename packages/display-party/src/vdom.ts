import { attributesModule, Attrs, Classes, classModule, eventListenersModule, Hooks, init, Module, On, Props, propsModule, VNode } from "snabbdom";
import { value, GetState, Store, StoreMessage } from "state-party";

// Tailored from Snabbdom VNode
export interface VirtualNode {
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

interface StoreContext {
  store?: Store
  unsubscribe: () => void
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

export type VirtualNodeAttribute = Property | Attribute | EventHandler | CssClasses | Key

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
      default:
        exhaustiveMatchGuard(attr)
    }
  }
  return dict
}

function exhaustiveMatchGuard(_: never) {
  throw new Error("Should never get here!")
}

function contextModule(mapper: (context: StoreContext) => StoreContext): Module {
  return {
    create: (_, vnode) => {
      if (vnode.data?.storeContext) {
        vnode.data.storeContext = mapper(vnode.data.storeContext)
      }
    }
  }
}

function createPatch(store: Store) {
  return init([
    contextModule((storeContext) => {
      storeContext.store = store
      return storeContext
    }),
    propsModule,
    attributesModule,
    classModule,
    eventListenersModule,
  ], undefined, {
    experimental: {
      fragments: true
    }
  })
}

export type DOMRenderer = (element: Element, node: VirtualNode) => Element

export function createDOMRenderer(store: Store): DOMRenderer {
  const patch = createPatch(store)
  return (element, node) => {
    const rootNode = patch(element, node)
    if (rootNode.elm instanceof DocumentFragment) {
      // @ts-ignore
      return rootNode.elm.parent
    } else {
      return rootNode.elm
    }
  }
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

export function makeStatefulVirtualNode(tag: string, generator: (get: GetState) => VirtualNode): VirtualNode {
  return {
    sel: tag,
    data: {
      storeContext: {
        unsubscribe: () => { }
      },
      hook: {
        create: (_, vnode) => {
          const token = value({ query: generator })
          const store: Store = vnode.data!.storeContext.store

          const patch = createPatch(store)

          let oldNode: VNode | Element = vnode.elm as Element

          vnode.data!.storeContext.unsubscribe = store.subscribe(token, (updatedNode) => {
            oldNode = patch(oldNode, updatedNode)
            vnode.elm = oldNode.elm
          })
        },
        postpatch: (oldVNode, vNode) => {
          vNode.data!.storeContext = oldVNode.data!.storeContext
        },
        destroy: (vnode) => {
          vnode.data!.storeContext.unsubscribe()
        },
        render: (store) => {
          const token = value({ query: generator })

          return new Promise((resolve) => {
            const unsubscribe = store.subscribe(token, (node) => {
              resolve(node)
              unsubscribe()
            })
          })
        }
      }
    },
    children: undefined,
    elm: undefined,
    text: undefined,
    key: undefined
  }
}
