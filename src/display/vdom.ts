import { attributesModule, Attrs, Classes, classModule, eventListenersModule, Hooks, init, On, Props, propsModule, VNode } from "snabbdom";
import { GetState, loop, State } from "../index.js";

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
  hook?: Hooks & { render?: (vnode: View) => Promise<View> };
  key?: string;
  loop?: LoopData
}

export interface LoopData {
  unsubscribe: () => void,
  islandName?: string
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

export function createPatch() {
  return init([
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
    loop: {
      unsubscribe: () => { }
    },
    hook: {
      render: (_: View): Promise<View> => {
        const stateDerivation = loop().deriveContainer(generator)

        return new Promise((resolve) => {
          const unsubscribe = stateDerivation.state.subscribe((view) => {
            resolve(view)
            unsubscribe()
          })
        })
      },
      create: (_, vnode) => {
        const derivation = loop().deriveContainer(generator)

        const patch = createPatch()

        let oldNode: VNode | Element = vnode.elm as Element

        vnode.data!.loop.unsubscribe = derivation.state.subscribe((updatedView) => {
          oldNode = patch(oldNode, updatedView)
          vnode.elm = oldNode.elm
        })
      },
      postpatch: (oldVNode, vNode) => {
        vNode.data!.loop = oldVNode.data!.loop
      },
      destroy: (vnode) => {
        vnode.data!.loop.unsubscribe()
      }
    }
  })
}
