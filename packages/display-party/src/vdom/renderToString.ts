import init from "snabbdom-to-html/init.js"
import modules from "snabbdom-to-html/modules/index.js"
import { GetState, Store, value } from "state-party";
import { VirtualNode } from "./virtualNode.js";
import { StringRenderer } from "./render.js";


export function createStringRenderer(store: Store): StringRenderer {
  const toHTML = init([
    modules.attributes,
    modules.class,
    modules.props,
  ])

  return async (node) => {
    const tree = await realizeVirtualTree(store, node)
    return toHTML(tree)
  }
}

async function realizeVirtualTree(store: Store, node: VirtualNode): Promise<VirtualNode> {
  let tree = node

  if (node.data?.storeContext) {
    tree = await getStatefulTree(store, node.data!.storeContext!.generator)
    return await realizeVirtualTree(store, tree)
  }

  if (tree.children && tree.children.length > 0) {
    let treeChildren: Array<VirtualNode> = []
    for (const child of tree.children ?? []) {
      const treeChild = await realizeVirtualTree(store, child)
      treeChildren.push(treeChild)
    }
    tree.children = treeChildren
  }

  return tree
}

async function getStatefulTree(store: Store, generator: (get: GetState) => VirtualNode): Promise<VirtualNode> {
  const token = value({ query: generator })

  return new Promise((resolve) => {
    const unsubscribe = store.subscribe(token, (node) => {
      resolve(node)
      unsubscribe()
    })
  })
}