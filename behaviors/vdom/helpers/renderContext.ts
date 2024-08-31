import { VirtualNode } from "@src/vdom/virtualNode.js"
import { HTMLView, renderToDOM } from "@src/htmlViewBuilder.js"
import { Context } from "esbehavior"
import { Container, Store, write } from "@spheres/store"

export class RenderApp<T> {
  private unmount: (() => void) | undefined
  private current: VirtualNode | undefined
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
    const base = document.createElement("div")
    document.body.appendChild(base)

    const renderResult = renderToDOM(this.store, base, view)

    this.unmount = renderResult.unmount
  }

  destroy() {
    this.unmount?.()
  }
}

export function renderContext<T = undefined>(): Context<RenderApp<T>> {
  return {
    init: () => {
      window._testPatchApp?.destroy()
      return new RenderApp()
    },
    teardown: async (patchApp) => {
      //@ts-ignore
      const isDebug = import.meta.env.VITE_DEBUG
      if (isDebug) {
        window._testPatchApp = patchApp
      } else {
        patchApp.destroy()
      }
    }
  }
}
