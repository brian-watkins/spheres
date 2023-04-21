import init from "snabbdom-to-html/init.js"
import modules from "snabbdom-to-html/modules/index.js"
import { View } from "./vdom.js";

export async function render(view: View): Promise<string> {
  const toHTML = init([
    modules.attributes,
    modules.class,
    modules.props,
  ])

  const tree = await realizeVirtualTree(view)
  return toHTML(tree)
}

async function realizeVirtualTree(view: View): Promise<View> {
  let tree = view

  if (view.data?.hook?.render) {
    tree = await view.data.hook.render(view)
  }

  if (tree.children && tree.children.length > 0) {
    let treeChildren: Array<View> = []
    for (const child of tree.children ?? []) {
      const treeChild = await realizeVirtualTree(child)
      treeChildren.push(treeChild)
    }
    tree.children = treeChildren
  }

  return tree
}