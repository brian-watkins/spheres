import { PublishableState, Store, WithMetaState, WritableState, write } from "../store/index.js"
import { SerializedState, SerializedStateType, StateManifest } from "../store/serialize.js"
import { createStore, getTokenRegistry, StoreInitializerActions } from "../store/store.js"
import { HTMLBuilder, HTMLView } from "./htmlElements.js"
import { HTMLElementSupport } from "./htmlElementSupport.js"
import { ActivateDomRenderer } from "./render/activateDomRenderer.js"
import { cleanRoot, DOMRoot } from "./render/domRoot.js"
import { EffectLocation } from "./render/effectLocation.js"
import { RenderResult } from "./render/index.js"

export function activateView(store: Store, element: Element, view: HTMLView): RenderResult {
  const registry = getTokenRegistry(store)

  const root = new DOMRoot(registry, element)
  cleanRoot(root)
  const renderer = new ActivateDomRenderer(new HTMLElementSupport(), root, registry, element.firstChild!, new EffectLocation(root => root).firstChild())
  view(renderer as unknown as HTMLBuilder)

  return root
}

export interface ActivationOptions {
  storeId?: string
  stateManifest?: StateManifest
  view: (activate: (element: Element, view: HTMLView) => void) => void
}

export interface ActivatedZone {
  store: Store
}

interface StreamingAppWindow extends Window {
  _spheres_register_streaming_store: (storeId: string, deserializer: (data: SerializedState) => void) => void
  _spheres_deserialize: (storeId: string, chunkId: string) => void
}

declare let window: StreamingAppWindow

export function prepareForStreaming() {
  const spheres_deserializers = new Map<string, (data: SerializedState) => void>()
  const spheres_deserializer_queue = new Map<string, Array<string>>()
  
  window._spheres_register_streaming_store = (storeId: string, deserializer: (data: SerializedState) => void) => {
    spheres_deserializers.set(storeId, deserializer)
    const chunks = spheres_deserializer_queue.get(storeId) ?? []
    for (const chunk of chunks) {
      window._spheres_deserialize(storeId, chunk)
    }
  }

  window._spheres_deserialize = (storeId: string, chunkId: string) => {
    const dataTag = document.querySelector(`script[data-spheres-store="${storeId}"][data-spheres-stream="${chunkId}"]`)
    if (dataTag !== null) {
      const deserializer = spheres_deserializers.get(storeId)
      if (deserializer !== undefined) {
        deserializer(JSON.parse(dataTag.textContent))
      } else {
        if (spheres_deserializer_queue.has(storeId)) {
          spheres_deserializer_queue.get(storeId)!.push(chunkId)
        } else {
          spheres_deserializer_queue.set(storeId, [chunkId])
        }
      }
    }
  }
}

export function activateZone(options: ActivationOptions): ActivatedZone {
  const store = createStore({
    id: options.storeId,
    async init(actions, store) {
      if (options.stateManifest !== undefined) {
        window._spheres_register_streaming_store(store.id, (state: SerializedState) => {
          deserializeState(store, options.stateManifest!, actions, state)
        })
      }

      // get the initial state
      const tag = document.querySelector(`script[data-spheres-store="${store.id}"][data-spheres-stream="init"]`)
      if (tag !== null && options.stateManifest !== undefined) {
        const data: Array<SerializedState> = JSON.parse(tag.textContent!)
        for (const value of data) {
          deserializeState(store, options.stateManifest!, actions, value)
        }
      }

      // activate the views
      options.view((el, view) => {
        activateView(store, el, view)
      })

      if (document.readyState !== "loading") {
        // the response is complete so no streaming to deal with
        return
      }

      // wait for the response to end
      return new Promise(resolve => {
        window.addEventListener("DOMContentLoaded", () => {
          resolve()
        })
      })
    }
  })

  return { store }
}


function deserializeState(store: Store, stateManifest: StateManifest, actions: StoreInitializerActions, state: SerializedState) {
  const token = stateManifest[state.t]
  if (token === undefined) return

  switch (state.k) {
    case SerializedStateType.Value:
      actions.supply(token as PublishableState<any>, state.v)
      break
    case SerializedStateType.Meta:
      const meta = state.v
      switch (meta.type) {
        case "pending":
          actions.pending(token as WithMetaState<any, any>, meta.message)
          break
        case "error":
          actions.error(token as WithMetaState<any, any>, meta.reason, meta.message)
          break
      }
      break
    case SerializedStateType.Message:
      store.dispatch(write(token as WritableState<any>, state.v))
      break
  }
}