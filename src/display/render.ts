import { VNode } from "snabbdom";
import init from "snabbdom-to-html/init.js"
import modules from "snabbdom-to-html/modules/index.js"
import { loop } from "../index.js";
import { StateDerivation } from "../loop.js";
import { View } from "./vdom.js";

function viewFragmentHandler(vnode: VNode) {
  if (vnode.sel === "view-fragment") {
    const derivation: StateDerivation<View> = loop().deriveContainer(vnode.data!.loop.generator)
    vnode.children = [ derivation.initialValue ]
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