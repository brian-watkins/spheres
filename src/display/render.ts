import init from "snabbdom-to-html/init.js"
import modules from "snabbdom-to-html/modules/index.js"
import { View } from "./vdom.js";
import { Store } from "../store/index.js";

export async function render(store: Store, view: View): Promise<string> {
  const toHTML = init([
    modules.attributes,
    modules.class,
    modules.props,
  ])

  const tree = await realizeVirtualTree(store, view)
  return toHTML(tree)
}

async function realizeVirtualTree(store: Store, view: View): Promise<View> {
  let tree = view

  if (view.data?.hook?.render) {
    tree = await view.data.hook.render(store, view)
    return await realizeVirtualTree(store, tree)
  }

  if (tree.children && tree.children.length > 0) {
    let treeChildren: Array<View> = []
    for (const child of tree.children ?? []) {
      const treeChild = await realizeVirtualTree(store, child)
      treeChildren.push(treeChild)
    }
    tree.children = treeChildren
  }

  return tree
}