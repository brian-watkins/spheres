import { patch, virtualize } from "@src/vdom/hyperDomRenderer.js"
import { VirtualNode } from "@src/vdom/virtualNode.js"
import { Context } from "esbehavior"

export class RenderApp {
  private unmount: (() => void) | undefined
  private current: VirtualNode | undefined

  mount(vnode: VirtualNode) {
    const base = document.createElement("div")
    document.querySelector("#test-display")?.appendChild(base)

    const renderResult = patch(virtualize(base), vnode)
    this.current = renderResult
    this.unmount = () => {
      this.current!.node?.parentNode?.removeChild(this.current!.node)
    }
  }

  patch(vnode: VirtualNode) {
    this.current = patch(this.current!, vnode)
  }

  destroy() {
    this.unmount?.()
  }
}

export function renderContext(): Context<RenderApp> {
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
