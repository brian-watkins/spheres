import { attributesModule, h, init, propsModule, VNode, VNodeChildElement } from "snabbdom";
import { State } from "./state";

export type View = VNode
export type ViewChild = VNodeChildElement

class Property {
  type: "property" = "property"

  constructor(public key: string, public value: string) { }
}

class Attribute {
  type: "attribute" = "attribute"

  constructor(public key: string, public value: string) { }
}

export type ViewAttribute = Property | Attribute //| CssClasses | EventHandler | NullViewAttribute

export function data(name: string, value: string = ""): ViewAttribute {
  return new Attribute(`data-${name}`, value)
}

function basicElement(tag: string, attributes: Array<ViewAttribute>, children: Array<ViewChild>) {
  return h(tag, makeAttributes(attributes), children)
}

export function div(attributes: Array<ViewAttribute>, children: Array<ViewChild>): View {
  return basicElement("div", attributes, children)
}

export function h1(attributes: Array<ViewAttribute>, children: Array<ViewChild>): View {
  return basicElement("h1", attributes, children)
}

export function p(attributes: Array<ViewAttribute>, children: Array<ViewChild>): View {
  return basicElement("p", attributes, children)
}

export function ul(attributes: Array<ViewAttribute>, children: Array<ViewChild>): View {
  return basicElement("ul", attributes, children)
}

export function li(attributes: Array<ViewAttribute>, children: Array<ViewChild>): View {
  return basicElement("li", attributes, children)
}

export type ViewGenerator = (parent: View) => View

export function viewGenerator(viewState: State<View>): View {
  return h("view-fragment", {
    hook: {
      insert: (vnode) => {
        const patch = init([
          propsModule,
          attributesModule,
        ])      

        const holder = document.createElement("view-holder")
        vnode.elm!.appendChild(holder)

        let oldNode: VNode | HTMLElement = holder

        viewState.onChange(() => {
          oldNode = patch(oldNode, viewState.read())
        })
      },
      destroy: (vnode) => {
        vnode.elm!.childNodes.forEach(node => node.remove())
      }
    }
  })
}

function makeAttributes(attributes: Array<ViewAttribute>): any {
  const dict: any = {
    props: {},
    attrs: {},
  }
  for (const attr of attributes) {
    switch (attr.type) {
      case "property":
        dict.props[attr.key] = attr.value
        break
      case "attribute":
        dict.attrs[attr.key] = attr.value
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