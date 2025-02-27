import { Store } from "../store/index.js"
import { getTokenRegistry } from "../store/store.js"
import { HTMLView } from "../view/index.js"
import { IdSequence } from "../view/render/idSequence.js"
import { stringifyVirtualNode } from "./render/renderToString.js"
import { SSRBuilder } from "./render/ssrBuilder.js"
import { manifest } from "./render/assetManifest.js"
import { SpheresPluginOptions } from "./plugin/options.js"
import type { PluginOption } from "vite"
import { spheresServePlugin } from "./plugin/servePlugin.js"
import { spheresBuildPlugin } from "./plugin/buildPlugin.js"
export type { SpheresPluginOptions } from "./plugin/options.js"

export function spheres(options: SpheresPluginOptions = {}): PluginOption {
  return [
    spheresServePlugin(),
    spheresBuildPlugin(options)
  ]
}

export function renderToString(store: Store, view: HTMLView): string {
  const tokenRegistry = getTokenRegistry(store)
  const builder = new SSRBuilder(tokenRegistry, manifest)
  builder.subview(view)
  return stringifyVirtualNode(tokenRegistry, new IdSequence(), builder.toVirtualNode())
}
