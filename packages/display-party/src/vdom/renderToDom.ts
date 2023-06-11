import { Module, VNode, attributesModule, classModule, eventListenersModule, init, propsModule } from "snabbdom"
import { VirtualNode } from "./virtualNode.js"
import { GetState, Store } from "state-party"

function renderModule(store: Store): Module {
  return {
    create: (_, vnode) => {
      const generator: ((get: GetState) => VirtualNode) | undefined = vnode.data!.storeContext?.generator
      if (generator === undefined) return

      const patch = createPatch(store)

      let oldNode: VNode | Element = vnode.elm as Element

      vnode.data!.storeContext.unsubscribe = store.query(generator, (updatedNode) => {
        oldNode = patch(oldNode, updatedNode)
        vnode.elm = oldNode.elm
      })
    },
    destroy: (vnode) => {
      vnode.data!.storeContext?.unsubscribe?.()
    }
  }
}

function createPatch(store: Store) {
  return init([
    renderModule(store),
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
        node: rootNode as VirtualNode,
        // @ts-ignore
        root: rootNode.elm.parent!
      }
    } else {
      return {
        type: "element-root",
        node: rootNode as VirtualNode,
        root: rootNode.elm!
      }
    }
  }
}
