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

class ViewIslandHandler {
  handle(vnode: VNode, attributes: Map<string, string>) {
    if (vnode.sel === "view-island") {
      const derivation: StateDerivation<View> = loop().deriveContainer(vnode.data!.loop.generator)
      vnode.children = [ derivation.initialValue ]
      attributes.set("data-name", vnode.data!.loop!.islandName)
    }
  }
}

export function render(view: View): string {
  const viewIslandHandler = new ViewIslandHandler()
  
  const toHTML = init([
    modules.attributes,
    modules.class,
    modules.props,
    viewFragmentHandler,
    (vnode: VNode, attributes: Map<string, string>) => {
      viewIslandHandler.handle(vnode, attributes)
    }
  ])

  return toHTML(view)
}