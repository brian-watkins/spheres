import { activateView, HTMLView, RenderResult, renderToDOM } from "@view/index.js"
import { Context } from "best-behavior"
import { Container, createStore, Store, write } from "@store/index.js"
import { createStringRenderer } from "@server/index"

export class RenderApp<T> {
  private renderResult: RenderResult | undefined
  private store: Store = createStore()
  private _state: T | undefined

  setState(state: T) {
    this._state = state
  }

  get state(): T {
    return this._state!
  }

  writeTo<S, M = S>(token: Container<S, M>, value: M) {
    this.store.dispatch(write(token, value))
  }

  mountView(view: HTMLView) {
    this.renderResult = renderToDOM(this.store, document.body, view)
  }

  ssrAndActivate(view: HTMLView) {
    const htmlString = createStringRenderer(view)(this.store)
    console.log("HTML", htmlString)
    document.body.innerHTML = htmlString
    this.renderResult = activateView(this.store, document.body, view)
  }

  destroy() {
    this.renderResult?.unmount()
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