import { HTMLView, RenderResult, renderToDOM } from "@view/index.js"
import { Context } from "best-behavior"
import { Collection, Container, createStore, Store, write } from "@store/index.js"
import { createStringRenderer } from "@server/index"
import { activateView } from "@view/activate"
import { DOMChangeRecord, structureChangeRecord, textChangeRecord } from "./changeRecords"
import { WritableState } from "@store/message"

export class RenderApp<T> {
  private renderResult: RenderResult | undefined
  readonly store: Store = createStore()
  private _state: T | undefined
  private observer: MutationObserver | undefined
  public changeRecords: Array<DOMChangeRecord> = []
  public ssrHtmlString = ""

  setState(state: T) {
    this._state = state
  }

  get state(): T {
    return this._state!
  }

  writeTo<S, M = S>(token: Container<S, M>, value: M) {
    this.store.dispatch(write(token, value))
  }

  writeToCollection<K, M, S extends WritableState<unknown, M>>(collection: Collection<K, S>, key: K, value: M) {
    this.store.dispatch(write(collection.at(key), value))
  }

  mountView(view: HTMLView) {
    this.renderResult = renderToDOM(this.store, document.body, view)
  }

  ssrAndActivate(view: HTMLView) {
    this.ssrHtmlString = createStringRenderer(view)(this.store)
    document.body.innerHTML = this.ssrHtmlString
    this.renderResult = activateView(this.store, document.body, view)
  }

  observe(selector: string) {
    this.observer?.disconnect()
    this.changeRecords = []

    const target: HTMLElement = document.querySelector(selector)!

    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        switch (mutation.type) {
          case "characterData":
            this.changeRecords.push(textChangeRecord())
            break
          case "childList":
            this.changeRecords.push(structureChangeRecord({
              removedNodes: mutation.removedNodes.length,
              addedNodes: mutation.addedNodes.length
            }))
            break
        }
      }
    })

    this.observer.observe(target, {
      childList: true,
      subtree: true,
      characterData: true
    })
  }

  destroy() {
    this.renderResult?.unmount()
    this.observer?.disconnect()
  }
}

export function renderContext<T = undefined>(): Context<RenderApp<T>> {
  return {
    init: () => {
      window._testApp?.destroy()
      return new RenderApp()
    },
    teardown: async (testApp) => {
      window._testApp = testApp
    }
  }
}

interface TestAppWindow extends Window {
  _testApp: RenderApp<any> | undefined
}

declare let window: TestAppWindow