import { Store } from "../store/index.js"
import { getTokenRegistry } from "../store/store.js"
import { HTMLView } from "../view/index.js"
import { IdSequence } from "../view/render/idSequence.js"
import { stringifyVirtualNode } from "./renderToString.js"
import { SSRBuilder } from "./ssrBuilder.js"
export { spheres } from "./plugin.js"

export function renderToString(store: Store, view: HTMLView): string {
  const builder = new SSRBuilder()
  builder.subview(view)
  return stringifyVirtualNode(getTokenRegistry(store), new IdSequence(), builder.toVirtualNode())
}
