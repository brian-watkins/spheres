import { Container, Meta, Store } from "../store/index.js"
import { createStore, getTokenRegistry, InitializerActions } from "../store/store.js"
import { HTMLBuilder, HTMLView } from "./htmlElements.js"
import { HTMLElementSupport } from "./htmlElementSupport.js"
import { ActivateDomRenderer } from "./render/activateDomRenderer.js"
import { cleanRoot, DOMRoot } from "./render/domRoot.js"
import { RenderResult } from "./render/index.js"

export enum SerializedStateType {
  Container, Meta
}

export interface SerializedContainer {
  k: SerializedStateType.Container
  t: string
  v: any
}

export interface SerializedMeta {
  k: SerializedStateType.Meta
  t: string
  v: Meta<any, any>
}

export type StateMap = Record<string, Container<any>>

export type SerializedState = SerializedContainer | SerializedMeta

export function activateView(store: Store, element: Element, view: HTMLView): RenderResult {
  const registry = getTokenRegistry(store)

  const root = new DOMRoot(registry, element)
  cleanRoot(root)
  const renderer = new ActivateDomRenderer(new HTMLElementSupport(), root, registry, element.firstChild!)
  view(renderer as unknown as HTMLBuilder)

  return root
}

export interface ActivationOptions {
  storeId?: string
  stateMap?: StateMap
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
      if (tag !== null && options.stateMap !== undefined) {
        const data: Array<SerializedState> = JSON.parse(tag.textContent!)
        for (const value of data) {
          deserializeState(options.stateMap!, actions, value)
        }
      }

      // activate the views
      options.view((el, view) => {
        activateView(store, el, view)
      })

      // processing any streaming data that has already arrived
      const existingData = document.querySelectorAll(`script[data-spheres-stream="${store.id}"]`)
      existingData.forEach(el => {
        deserializeState(options.stateMap!, actions, JSON.parse(el.textContent!))
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
                  deserializeState(options.stateMap!, actions, JSON.parse(el.textContent!))
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

function deserializeState(stateMap: Record<string, Container<any>>, actions: InitializerActions, state: SerializedState) {
  const token = stateMap[state.t]
  if (token === undefined) return

  switch (state.k) {
    case SerializedStateType.Container:
      actions.supply(token, state.v)
      break
    case SerializedStateType.Meta:
      const meta = state.v
      switch (meta.type) {
        case "pending":
          actions.pending(token, meta.message)
          break
        case "error":
          actions.error(token, meta.reason, meta.message)
          break
      }
      break
  }
}