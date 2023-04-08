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
  private idCounter = 0
  private loaderRegistry: Map<string, string> = new Map()

  handle(vnode: VNode, attributes: Map<string, string>) {
    if (vnode.sel === "view-island") {
      const derivation: StateDerivation<View> = loop().deriveContainer(vnode.data!.loop.generator)
      vnode.children = [ derivation.initialValue ]
      const islandId = `island-${this.idCounter}`
      attributes.set("data-island-id", islandId)
      this.idCounter = this.idCounter + 1
      const loader = vnode.data!.loop.loader
      this.loaderRegistry.set(islandId, loader)
    }
  }

  hasIslands(): boolean {
    return this.loaderRegistry.size > 0
  }

  registryScript(): string {
    let lines: Array<string> = []
    lines.push("<script type='module'>")
    lines.push(`window.esdisplay = { islands: {} };`)
    for (const islandIndex of this.loaderRegistry.keys()) {
      lines.push(`window.esdisplay.islands["${islandIndex}"] = ${this.loaderRegistry.get(islandIndex)};`)
    }
    lines.push("</script>")
    return lines.join("\n")
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

  let html = toHTML(view)

  if (viewIslandHandler.hasIslands()) {
    html += "\n" + viewIslandHandler.registryScript()
  }

  return html
}