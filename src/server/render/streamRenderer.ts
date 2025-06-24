import { State, Store, useEffect } from "../../store/index.js"
import { Container } from "../../store/state/container.js"
import { getTokenRegistry } from "../../store/store.js"
import { TokenRegistry } from "../../store/tokenRegistry.js"
import { SerializedState, SerializedStateType, StateMap } from "../../view/activate.js"
import { HTMLView } from "../../view/index.js"
import { buildActivationScripts, buildStringRenderer } from "./stringRenderer.js"
import { ViteContext } from "./viteBuilder.js"

export interface StreamRendererOptions {
  stateMap?: StateMap
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

        if (options.stateMap) {
          for (const key in options.stateMap) {
            streamUpdates(store, key, options.stateMap![key], controller)
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

function scriptTag(storeId: string, data: SerializedState): string {
  return `<script type="application/json" data-spheres-stream="${storeId}">${JSON.stringify(data)}</script>`
}

export class Zone {
  private buildHTMLString: (store: Store) => string
  private buildActivationScripts: (store: Store) => string

  constructor(view: HTMLView, private options: InternalZoneOptions) {
    // just pass the vite context so we only generate the html
    this.buildHTMLString = buildStringRenderer(view, { viteContext: options.viteContext })
    this.buildActivationScripts = buildActivationScripts(this.options)
  }

  useStream(registry: TokenRegistry, controller: ReadableStreamDefaultController): Promise<void> {
    const zoneStore: Store = registry.getState(this.options.store).getValue()
    const initialHtml = this.buildHTMLString(zoneStore)
    const initialScripts = this.buildActivationScripts(zoneStore)

    const mountScript = `<script>document.querySelector("${this.options.mountPoint}").innerHTML = '${initialHtml}';</script>`

    controller.enqueue(mountScript)
    controller.enqueue(initialScripts)

    const stateMap = this.options.stateMap
    if (stateMap) {
      for (const key in stateMap) {
        streamUpdates(zoneStore, key, stateMap![key], controller)
      }
    }

    return zoneStore.initialized
  }
}

export interface InternalZoneOptions {
  stateMap?: StateMap
  activationScripts?: Array<string>
  store: State<Store>
  mountPoint: string
  viteContext?: ViteContext
}

function streamUpdates(store: Store, key: string, token: State<any>, controller: ReadableStreamDefaultController) {
  useEffect(store, {
    init(get) {
      get(token)
    },
    run(get) {
      controller.enqueue(scriptTag(store.id, {
        k: SerializedStateType.Container,
        t: key,
        v: get(token)
      }))
    },
  })
  if (token instanceof Container) {
    useEffect(store, {
      init(get) {
        get(token.meta)
      },
      run(get) {
        const metaValue = get(token.meta)
        if (metaValue.type !== "ok") {
          controller.enqueue(scriptTag(store.id, {
            k: SerializedStateType.Meta,
            t: key,
            v: get(token.meta)
          }))
        }
      },
    })
  }
}