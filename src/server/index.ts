import { State, StateManifest, Store } from "../store/index.js"
import { HTMLView } from "../view/index.js"
import { buildStreamRenderer, InternalZoneOptions, StreamRendererOptions, Zone } from "./render/streamRenderer.js"
import { buildStringRenderer, StringRendererOptions } from "./render/stringRenderer.js"
export type { SpheresPluginOptions } from "./plugin/index.js"
export { spheres } from "./plugin/index.js"
export type { Zone } from "./render/streamRenderer.js"

export type HTMLStringRenderer = (store: Store) => string
export type HTMLStreamRenderer = (store: Store) => ReadableStream

export interface RendererOptions {
  stateManifest?: StateManifest
  activationScripts?: Array<string>
}

export function createStringRenderer(view: HTMLView, options?: RendererOptions): HTMLStringRenderer
export function createStringRenderer(view: HTMLView, options: StringRendererOptions = {}): HTMLStringRenderer {
  return buildStringRenderer(view, options)
}

export interface StreamOptions {
  stateManifest?: StateManifest
  activationScripts?: Array<string>
  zones?: Array<Zone>
}

export function createStreamRenderer(view: HTMLView, options?: StreamOptions): HTMLStreamRenderer
export function createStreamRenderer(view: HTMLView, options: StreamRendererOptions = {}): HTMLStreamRenderer {
  return buildStreamRenderer(view, options)
}

export interface ZoneOptions {
  stateManifest?: StateManifest
  activationScripts?: Array<string>
  store: State<Store>
  mountPoint: string
}

export function zone(view: HTMLView, options: ZoneOptions): Zone
export function zone(view: HTMLView, options: InternalZoneOptions): Zone {
  return new Zone(view, options)
}