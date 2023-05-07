import { attributesModule, Attrs, Classes, classModule, eventListenersModule, Hooks, init, Module, On, Props, propsModule, VNode } from "snabbdom";
import { GetState, derived, State, Store } from "../store/store.js";

// Tailored from Snabbdom VNode
export interface View {
  sel: string | undefined;
  data: ViewData | undefined;
  children: Array<View> | undefined;
  elm: Node | undefined;
  text: string | undefined;
  key: string | undefined;
}

// Tailored from Snabbdom VNodeData
export interface ViewData {
  props?: Props;
  attrs?: Attrs;
  class?: Classes;
  on?: On;
  hook?: Hooks & { render?: (store: Store, vnode: View) => Promise<View> };
  key?: string;
  storeContext?: StoreContext
}

export interface StoreContext {
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

  constructor(public event: string, public generator: (evt: Event) => any) { }
}

export class NoAttribute {
  type: "no-attribute" = "no-attribute"
}

export type ViewAttribute = Property | Attribute | EventHandler | CssClasses | Key | NoAttribute

export function makeViewData(attributes: Array<ViewAttribute>): ViewData {
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
        dict.on[attr.event] = function (evt: Event) {
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
      case "no-attribute":
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

export function createPatch(store: Store) {
  return init([
    contextModule((storeContext) => {
      storeContext.store = store
      return storeContext
    }),
    propsModule,
    attributesModule,
    classModule,
    eventListenersModule,
  ])
}

export function makeNode(tag: string | undefined, data: ViewData | undefined, children?: Array<View>, text?: string): View {
  // See Snabbdom src/h.ts and src/vnode.ts
  // We are not supporting SVG at the moment but otherwise this should work
  return {
    sel: tag,
    data,
    children,
    text,
    elm: undefined,
    key: data?.key
  }
}

export interface StatefulViewOptions {
  key?: string | State<any>
}

export function statefulView(tag: string, options: StatefulViewOptions, generator: (get: GetState) => View): View {
  return makeNode(tag, {
    key: options.key?.toString(),
    storeContext: {
      unsubscribe: () => { }
    },
    hook: {
      create: (_, vnode) => {
        const token = derived(generator)
        const store: Store = vnode.data!.storeContext.store

        const patch = createPatch(store)

        let oldNode: VNode | Element = vnode.elm as Element

        vnode.data!.storeContext.unsubscribe = store.subscribe(token, (updatedView) => {
          oldNode = patch(oldNode, updatedView)
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
        const token = derived(generator)

        return new Promise((resolve) => {
          const unsubscribe = store.subscribe(token, (view) => {
            resolve(view)
            unsubscribe()
          })
        })
      }
    }
  })
}