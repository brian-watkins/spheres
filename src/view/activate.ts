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

export function activateZone(options: ActivationOptions): ActivatedZone {
  const store = createStore({
    id: options.storeId,
    async init(actions, store) {
      // get the initial state
      const tag = document.querySelector(`script[data-spheres-store="${store.id}"]`)
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

      // processing any streaming data that has already arrived
      const existingData = document.querySelectorAll(`script[data-spheres-stream="${store.id}"]`)
      existingData.forEach(el => {
        deserializeState(store, options.stateManifest!, actions, JSON.parse(el.textContent!))
      })

      if (document.readyState !== "loading") {
        // the response is complete so no streaming to deal with
        return
      }

      // notify on any incoming streaming data
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'SCRIPT') {
                const el = node as Element
                if (el.getAttribute("data-spheres-stream") === store.id) {
                  deserializeState(store, options.stateManifest!, actions, JSON.parse(el.textContent!))
                }
              }
            })
          }
        })
      })

      observer.observe(document.body, { childList: true })

      // wait for the response to end and then stop observing
      return new Promise(resolve => {
        window.addEventListener("DOMContentLoaded", () => {
          observer.disconnect()
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