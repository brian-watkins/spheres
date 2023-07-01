import { VNode, attributesModule, eventListenersModule, init, propsModule } from "snabbdom"
import { VirtualNode } from "./virtualNode.js"
import { GetState, Store } from "state-party"

function createPatch(store: Store) {
  const patch = init([
    {
      create: (_, vnode) => {
        const generator: ((get: GetState) => VirtualNode) | undefined = vnode.data!.storeContext?.generator
        if (generator === undefined) return
  
        let current: VNode | Element = vnode
        store.query(generator, (updated) => {
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
