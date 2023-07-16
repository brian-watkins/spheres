import { VNode, attributesModule, eventListenersModule, init, propsModule, toVNode } from "snabbdom"
import { StoreContext, VirtualNode } from "./virtualNode.js"
import { Store } from "state-party"

const templates: Map<string, VNode> = new Map()

function createPatch(store: Store) {
  const patch = init([
    {
      create: (_, vnode) => {
        const storeContext: StoreContext = vnode.data!.storeContext
        if (storeContext === undefined) return

        let current: VNode | Element
        if (storeContext.template) {
          if (!templates.has(storeContext.template)) {
            const template = document.getElementById(storeContext.template) as HTMLTemplateElement
            const content = template.content.cloneNode(true)
            templates.set(storeContext.template, toVNode(content))
          }
          current = templates.get(storeContext.template)!
        } else {
          current = vnode
        }

        store.query(storeContext.generator, (updated) => {
          current = patch(current, updated)
          vnode.elm = current.elm
        })
      }
    },
    propsModule,
    attributesModule,
    eventListenersModule,
  ], undefined, {
    experimental: {
      fragments: true
    }
  })

  return patch
}

export interface ElementRoot {
  type: "element-root"
  root: Node
}

export interface FragmentRoot {
  type: "fragment-root"
  root: Node
}

export type RenderedRoot = ElementRoot | FragmentRoot

export type DOMRenderer = (element: VNode | Element, node: VirtualNode) => RenderedRoot

export function createDOMRenderer(store: Store): DOMRenderer {
  const patch = createPatch(store)
  return (element, node) => {
    const rootNode = patch(element, node)
    if (rootNode.elm instanceof DocumentFragment) {
      return {
        type: "fragment-root",
        // @ts-ignore
        root: rootNode.elm.parent!
      }
    } else {
      return {
        type: "element-root",
        root: rootNode.elm!
      }
    }
  }
}
