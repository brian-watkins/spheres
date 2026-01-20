import { HTMLView, RenderResult, renderToDOM } from "@view/index.js"
import { Context } from "best-behavior"
import { Collection, createStore, StateManifest, Store, WritableState, write } from "@store/index.js"
import { createStringRenderer } from "@server/index"
import { activateView, activateZone, prepareForStreaming, StreamingAppWindow } from "@view/activate"
import { DOMChangeRecord, structureChangeRecord, textChangeRecord } from "./changeRecords"
import { SerializedState } from "@store/serialize"

export class RenderApp<T> {
  private renderResult: RenderResult | undefined
  readonly store: Store = createStore()
  private serverSideStore: Store | undefined = undefined
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

  get serverStore(): Store {
    if (this.serverSideStore === undefined) {
      this.serverSideStore = createStore()
    }
    return this.serverSideStore
  }

  writeTo<S, M = S>(token: WritableState<S, M>, value: M) {
    this.store.dispatch(write(token, value))
  }

  writeToCollection<K, M, S extends WritableState<unknown, M>>(collection: Collection<K, S>, key: K, value: M) {
    this.store.dispatch(write(collection.at(key), value))
  }

  mountView(view: HTMLView) {
    this.renderResult = renderToDOM(this.store, document.body, view)
  }

  ssrAndActivate(view: HTMLView) {
    this.loadServerSideRenderedHtml(view)
    this.renderResult = activateView(this.store, document.body, view)
  }

  loadServerSideRenderedHtml(view: HTMLView) {
    this.ssrHtmlString = createStringRenderer(view)(this.serverSideStore ?? this.store)
    document.body.innerHTML = this.ssrHtmlString
  }

  initStream() {
    prepareForStreaming()
  }

  streamState(chunkId: string, state: SerializedState) {
    const script = document.createElement("script")
    script.setAttribute("data-spheres-store", this.store.id)
    script.setAttribute("data-spheres-stream", chunkId)
    script.setAttribute("type", "application/json")
    script.appendChild(document.createTextNode(JSON.stringify(state)))
    document.body.appendChild(script)
    window._spheres_deserialize(this.store.id, chunkId)
  }

  activateSSRZone(view: HTMLView, stateManifest: StateManifest) {
    activateZone({
      stateManifest,
      view(activate) {
        activate(document.body, view)
      }
    })
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

interface TestAppWindow extends StreamingAppWindow {
  _testApp: RenderApp<any> | undefined
}

declare let window: TestAppWindow