import init from "snabbdom-to-html/init.js"
import modules from "snabbdom-to-html/modules/index.js"
import { Store } from "state-party";
import { VirtualNode } from "./vdom.js";

export type StringRenderer = (node: VirtualNode) => Promise<string>

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

  if (node.data?.hook?.render) {
    tree = await node.data.hook.render(store, node)
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