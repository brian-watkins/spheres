import { State, Store, useEffect } from "../../store/index.js";
import { getTokenRegistry } from "../../store/store.js";
import { TokenRegistry } from "../../store/tokenRegistry.js";
import { SerializedState } from "../../view/activate.js";
import { HTMLView } from "../../view/index.js";
import { buildActivationScripts, buildStringRenderer } from "./stringRenderer.js";
import { ViteContext } from "./viteBuilder.js";

export interface StreamRendererOptions {
  stateMap?: Record<string, State<any>>
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
            useEffect(store, {
              init(get) {
                get(options.stateMap![key])
              },
              run(get) {
                controller.enqueue(scriptTag(store.id, {
                  t: key,
                  v: get(options.stateMap![key])
                  // what about meta values for errors?
                }))
              },
            })
          }
        }

        const waitUntilAll: Array<Promise<void>> = [ store.initialized ]

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
        useEffect(zoneStore, {
          init(get) {
            get(stateMap![key])
          },
          run(get) {
            controller.enqueue(scriptTag(zoneStore.id, {
              t: key,
              v: get(stateMap[key])
              // what about meta values for errors?
            }))
          },
        })
      }
    }

    return zoneStore.initialized
  }
}

export interface InternalZoneOptions {
  stateMap?: Record<string, State<any>>
  activationScripts?: Array<string>
  store: State<Store>
  mountPoint: string
  viteContext?: ViteContext
}
