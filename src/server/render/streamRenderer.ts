import { State, Store, useEffect } from "../../store/index.js"
import { SerializableState, serializedValue, serializedMessage, serializedMeta, SerializedState, StateManifest } from "../../store/serialize.js"
import { Container } from "../../store/state/container.js"
import { ContainerHooks, getTokenRegistry, ReactiveEffect, useContainerHooks, WriteHookActions } from "../../store/store.js"
import { GetState, TokenRegistry } from "../../store/tokenRegistry.js"
import { HTMLView } from "../../view/index.js"
import { getActivationTemplate } from "./elementRenderers/activationElements.js"
import { buildStringRenderer } from "./stringRenderer.js"
import { stringForTemplate } from "./template.js"
import { ViteContext } from "./viteContext.js"

export interface StreamRendererOptions {
  stateManifest?: StateManifest
  activationScripts?: Array<string>
  zones?: Array<Zone>
  viteContext?: ViteContext
}

export function buildStreamRenderer(view: HTMLView, options: StreamRendererOptions): (store: Store) => ReadableStream {
  const htmlRenderer = buildStringRenderer(view, options)

  return (store) => {
    const initialHTML = htmlRenderer(store)

    return new ReadableStream({
      start(controller) {
        controller.enqueue(initialHTML)

        if (options.stateManifest) {
          const stateStream = new SpheresStateStream(controller)
          for (const key in options.stateManifest) {
            streamUpdates(store, key, options.stateManifest![key], stateStream)
          }
        }

        const waitUntilAll: Array<Promise<void>> = [store.initialized]

        // stream zone
        for (const zone of options.zones ?? []) {
          const streamComplete = zone.useStream(getTokenRegistry(store), controller)
          waitUntilAll.push(streamComplete)
        }

        // wait for all the stores associated with all the zones to be initialized
        Promise.all(waitUntilAll).then(() => {
          controller.close()
        })
      },
    })
  }
}

export class Zone {
  private buildHTMLString: (store: Store) => string

  constructor(view: HTMLView, private options: InternalZoneOptions) {
    // just pass the vite context so we only generate the html
    this.buildHTMLString = buildStringRenderer(view, { viteContext: options.viteContext })
  }

  useStream(registry: TokenRegistry, controller: ReadableStreamDefaultController): Promise<void> {
    const zoneStore: Store = registry.getState(this.options.store).getValue()
    const initialHtml = this.buildHTMLString(zoneStore)

    const mountScript = `<script>document.querySelector("${this.options.mountPoint}").innerHTML = '${initialHtml}';</script>`

    controller.enqueue(mountScript)

    const activationTemplate = getActivationTemplate(this.options)
    const activationString = stringForTemplate(getTokenRegistry(zoneStore), activationTemplate)
    controller.enqueue(activationString)

    const stateManifest = this.options.stateManifest
    if (stateManifest) {
      const stateStream = new SpheresStateStream(controller)
      for (const key in stateManifest) {
        streamUpdates(zoneStore, key, stateManifest![key], stateStream)
      }
    }

    return zoneStore.initialized
  }
}

export interface InternalZoneOptions {
  stateManifest?: StateManifest
  activationScripts?: Array<string>
  store: State<Store>
  mountPoint: string
  viteContext?: ViteContext
}

function streamUpdates(store: Store, key: string, token: SerializableState, stream: SpheresStateStream) {
  const streamer = new StateStreamer(store, stream, key, token)
  useEffect(store, streamer)
  if (token instanceof Container) {
    useContainerHooks(store, token, streamer)
  }

  useEffect(store, new MetaStateStreamer(store, stream, key, token))
}

class SpheresStateStream {
  private chunkCount: number = 0

  constructor(private controller: ReadableStreamDefaultController) { }

  enqueueState(store: Store, state: SerializedState) {
    const chunkId = `${this.chunkCount++}`
    this.controller.enqueue(this.scriptTag(store.id, chunkId, state))
    this.controller.enqueue(this.markerTag(store.id, chunkId))
  }

  private scriptTag(storeId: string, chunkId: string, data: SerializedState): string {
    return `<script type="application/json" data-spheres-store="${storeId}" data-spheres-stream="${chunkId}">${JSON.stringify(data)}</script>`
  }

  private markerTag(storeId: string, chunkId: string): string {
    return `<script>window._spheres_deserialize("${storeId}", "${chunkId}");</script>`
  }
}

class MetaStateStreamer implements ReactiveEffect {
  constructor(
    private store: Store,
    private stream: SpheresStateStream,
    private tokenKey: string,
    private token: SerializableState
  ) { }


  init(get: GetState): void {
    get(this.token.meta)
  }

  run(get: GetState): void {
    const metaValue = get(this.token.meta)
    if (metaValue.type !== "ok") {
      this.stream.enqueueState(this.store, serializedMeta(this.tokenKey, metaValue))
    }
  }

}

class StateStreamer implements ReactiveEffect, ContainerHooks<any, any> {
  private isWriting: boolean = false

  constructor(
    private store: Store,
    private stream: SpheresStateStream,
    private tokenKey: string,
    private token: SerializableState
  ) { }

  init(get: GetState): void {
    get(this.token)
  }

  run(get: GetState): void {
    if (this.isWriting) return

    this.stream.enqueueState(this.store, serializedValue(this.tokenKey, get(this.token)))
  }

  onWrite(message: any, actions: WriteHookActions<any, any, unknown>): void {
    this.isWriting = true
    this.stream.enqueueState(this.store, serializedMessage(this.tokenKey, message))
    actions.ok(message)
    this.isWriting = false
  }
}