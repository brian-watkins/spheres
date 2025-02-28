import { Store } from "../store/index.js"
import { getTokenRegistry } from "../store/store.js"
import { HTMLView } from "../view/index.js"
import { IdSequence } from "../view/render/idSequence.js"
import { stringifyVirtualNode } from "./render/renderToString.js"
import { SSRBuilder, ViteContext } from "./render/ssrBuilder.js"
export type { SpheresPluginOptions } from "./plugin/buildPlugin.js"
export type { ViteContext } from "./render/ssrBuilder.js"
export { spheres } from "./plugin/index.js"

export function renderToString(store: Store, view: HTMLView): string
export function renderToString(store: Store, view: HTMLView, viteContext?: ViteContext): string {
  const tokenRegistry = getTokenRegistry(store)
  const builder = new SSRBuilder(tokenRegistry, viteContext)
  builder.subview(view)
  return stringifyVirtualNode(tokenRegistry, new IdSequence(), builder.toVirtualNode())
}
