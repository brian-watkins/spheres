import { VNode } from "snabbdom";
import init from "snabbdom-to-html/init.js"
import modules from "snabbdom-to-html/modules/index.js"
import { View } from "./view.js";

function viewFragmentHandler(vnode: VNode) {
  if (vnode.sel === "view-fragment") {
    vnode.children = [ vnode.data!.loop.initialView ]
  }
}

const toHTML = init([
  modules.attributes,
  modules.class,
  modules.props,
  viewFragmentHandler
])

export function render(view: View): string {
  return toHTML(view)
}