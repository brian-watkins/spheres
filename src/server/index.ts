import { Store } from "../store/index.js"
import { getTokenRegistry } from "../store/store.js"
import { HTMLView } from "../view/index.js"
import { IdSequence } from "../view/render/idSequence.js"
import { stringifyVirtualNode } from "./renderToString.js"
import { SSRBuilder } from "./ssrBuilder.js"
import { manifest } from "./assetManifest.js"
export { spheres } from "./plugin.js"

export function renderToString(store: Store, view: HTMLView): string {
  const tokenRegistry = getTokenRegistry(store)
  const builder = new SSRBuilder(tokenRegistry, manifest)
  builder.subview(view)
  return stringifyVirtualNode(tokenRegistry, new IdSequence(), builder.toVirtualNode())
}
