import { Container, Meta, State, Store } from "../store/index.js"
import { createStore, getTokenRegistry } from "../store/store.js"
import { HTMLBuilder, HTMLView } from "./htmlElements.js"
import { ActivateDomRenderer } from "./render/activateDomRenderer.js"
import { cleanRoot, DOMRoot } from "./render/domRoot.js"
import { HtmlRendererDelegate } from "./render/htmlDelegate.js"
import { RenderResult } from "./render/index.js"

export interface SerializedState {
  t: string
  v: any
  mv?: Meta<any, any>
}

export function activateView(store: Store, element: Element, view: HTMLView): RenderResult {
  const registry = getTokenRegistry(store)

  const root = new DOMRoot(registry, element)
  cleanRoot(root)
  const renderer = new ActivateDomRenderer(new HtmlRendererDelegate(), root, registry, element.firstChild!)
  view(renderer as unknown as HTMLBuilder)

  return root
}

export interface ActivationOptions {
  storeId?: string
  stateMap?: Record<string, State<any>>
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
          const token = options.stateMap[value.t] as Container<any> | undefined
          if (token === undefined) continue

          actions.supply(token, value.v)
          if (value.mv) {
            const meta = value.mv
            switch (meta.type) {
              case "pending":
                actions.pending(token, meta.message)
                break
              case "error":
                actions.error(token, meta.reason, meta.message)
                break
            }
          }
        }
      }

      // activate the views
      options.view((el, view) => {
        activateView(store, el, view)
      })

      // processing any streaming data that has already arrived
      const existingData = document.querySelectorAll(`script[data-spheres-stream="${store.id}"]`)
      existingData.forEach(el => {
        const data: SerializedState = JSON.parse(el.textContent!)
        actions.supply(options.stateMap![data.t] as Container<any>, data.v)
      })

      // notify on any incoming streaming data
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'SCRIPT') {
                const el = node as Element
                if (el.getAttribute("data-spheres-stream") === store.id) {
                  const data: SerializedState = JSON.parse(el.textContent!)
                  actions.supply(options.stateMap![data.t] as Container<any>, data.v)
                }
              }
            })
          }
        })
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      })

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
