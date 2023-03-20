import { attributesModule, Attrs, Classes, classModule, eventListenersModule, Hooks, init, On, Props, propsModule, VNode } from "snabbdom";
import { LoopMessage, State } from "../loop.js";

// Tailored from Snabbdom VNode
export interface View {
  sel: string | undefined;
  data: ViewData | undefined;
  children: Array<View | string> | undefined;
  elm: Node | undefined;
  text: string | undefined;
  key: string | undefined;
}

// Tailored from Snabbdom VNodeData
interface ViewData {
  props?: Props;
  attrs?: Attrs;
  class?: Classes;
  on?: On;
  hook?: Hooks;
  key?: string;
  loop?: LoopData
}

interface LoopData {
  unsubscribe: () => void
}

class Property {
  type: "property" = "property"

  constructor(public key: string, public value: string) { }
}

class Attribute {
  type: "attribute" = "attribute"

  constructor(public key: string, public value: string) { }
}

class Key {
  type: "key" = "key"

  constructor(public key: string) { }
}

class NoAttribute {
  type: "no-attribute" = "no-attribute"
}

export type ViewAttribute = Property | Attribute | EventHandler | CssClasses | Key | NoAttribute

export function property(name: string, value: string): ViewAttribute {
  return new Property(name, value)
}

export function id(value: string): ViewAttribute {
  return new Property("id", value)
}

export function key(value: string | number | State<any>): ViewAttribute {
  return new Key(`${value}`)
}

export function data(name: string, value: string = ""): ViewAttribute {
  return new Attribute(`data-${name}`, value)
}

export function value(value: string): ViewAttribute {
  return new Attribute("value", value)
}

export function disabled(isDisabled: boolean): ViewAttribute {
  return isDisabled ? new Attribute("disabled", "") : new NoAttribute()
}

function makeNode(tag: string | undefined, data: ViewData | undefined, children?: Array<View>, text?: string): View {
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

export function text(value: string): View {
  return makeNode(undefined, undefined, undefined, value)
}

export function element(tag: string, attributes: Array<ViewAttribute>, children: Array<View>): View {
  return makeNode(tag, makeViewData(attributes), children)
}

export function div(attributes: Array<ViewAttribute>, children: Array<View>): View {
  return element("div", attributes, children)
}

export function h1(attributes: Array<ViewAttribute>, children: Array<View>): View {
  return element("h1", attributes, children)
}

export function hr(attributes: Array<ViewAttribute>, children: Array<View>): View {
  return element("hr", attributes, children)
}

export function article(attributes: Array<ViewAttribute>, children: Array<View>): View {
  return element("article", attributes, children)
}

export function p(attributes: Array<ViewAttribute>, children: Array<View>): View {
  return element("p", attributes, children)
}

export function ul(attributes: Array<ViewAttribute>, children: Array<View>): View {
  return element("ul", attributes, children)
}

export function li(attributes: Array<ViewAttribute>, children: Array<View>): View {
  return element("li", attributes, children)
}

export function input(attributes: Array<ViewAttribute>, children: Array<View>): View {
  return element("input", attributes, children)
}

export function button(attributes: Array<ViewAttribute>, children: Array<View>): View {
  return element("button", attributes, children)
}

export function textarea(attributes: Array<ViewAttribute>, children: Array<View>): View {
  return element("textarea", attributes, children)
}

export type CssClassname = string

class CssClasses {
  type: "css-classes" = "css-classes"

  constructor(public classObject: { [key: CssClassname]: boolean }) { }
}

export function cssClasses(classes: Array<CssClassname>): ViewAttribute {
  const classObject: { [key: CssClassname]: boolean } = {}
  for (const classname of classes) {
    classObject[classname] = true
  }

  return new CssClasses(classObject)
}

class EventHandler {
  type: "event" = "event"

  constructor(public event: string, public generator: (evt: Event) => any) { }
}

export function onClick<M extends LoopMessage<any>>(message: M): ViewAttribute {
  return new EventHandler("click", () => message)
}

export function onInput<M extends LoopMessage<any>>(generator: (value: string) => M): ViewAttribute {
  return new EventHandler("input", (evt) => {
    return generator((<HTMLInputElement>evt.target)?.value)
  })
}

export type ViewGenerator = (parent: View) => View

export function stateful(viewState: State<View>, key?: string): View {
  return makeNode("view-fragment", {
    loop: { unsubscribe: () => {} },
    key,
    hook: {
      create: (_, vnode) => {
        const patch = init([
          propsModule,
          attributesModule,
          classModule,
          eventListenersModule
        ])

        let oldNode: VNode | Element = vnode.elm as Element

        vnode.data!.loop.unsubscribe = viewState.subscribe((updatedView) => {
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

function makeViewData(attributes: Array<ViewAttribute>): ViewData {
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