import { Store } from "../store/index.js"
import { HTMLView } from "../view/index.js"
import { buildStringRenderer } from "./render/stringRenderer.js"
import { ViteContext } from "./render/viteBuilder.js"
export type { SpheresPluginOptions } from "./plugin/index.js"
export { spheres } from "./plugin/index.js"

export type HtmlStringRenderer = (store: Store) => string

export function createStringRenderer(view: HTMLView): HtmlStringRenderer
export function createStringRenderer(view: HTMLView, viteContext?: ViteContext): HtmlStringRenderer {
  return buildStringRenderer(view, viteContext)
}
