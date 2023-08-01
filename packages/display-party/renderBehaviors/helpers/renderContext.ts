import { patch, virtualize } from "@src/vdom/renderToDom.js"
import { VirtualNode } from "@src/vdom/virtualNode.js"
import { Context } from "esbehavior"
import { Container, Store, StoreMessage, write } from "state-party"

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

  mount(vnode: VirtualNode) {
    const base = document.createElement("div")
    document.querySelector("#test-display")?.appendChild(base)

    const renderResult = patch(this.store, virtualize(base), vnode)
    this.current = renderResult

    this.current.node?.addEventListener("displayMessage", (evt: Event) => {
      const displayMessageEvent = evt as CustomEvent<StoreMessage<any>>
      this.store.dispatch(displayMessageEvent.detail)
    })

    this.unmount = () => {
      this.current!.node?.parentNode?.removeChild(this.current!.node)
    }
  }

  patch(vnode: VirtualNode) {
    this.current = patch(this.store, this.current!, vnode)
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
      const isDebug = await window._testDebug()
      if (isDebug) {
        window._testPatchApp = patchApp
      } else {
        patchApp.destroy()
      }
    }
  }
}
