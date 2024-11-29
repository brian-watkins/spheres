import { activateView, HTMLView, RenderResult, renderToDOM, renderToString } from "@src/index.js"
import { Context } from "best-behavior"
import { Container, Store, write } from "@spheres/store"

export class RenderApp<T> {
  private renderResult: RenderResult | undefined
  private store: Store = new Store()
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
    const htmlString = renderToString(this.store, view)
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