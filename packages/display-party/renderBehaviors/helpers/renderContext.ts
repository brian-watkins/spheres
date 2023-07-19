import { createDOMRenderer } from "@src/vdom/hyperDomRenderer.js"
import { DOMRenderer } from "@src/vdom/render.js"
import { VirtualNode } from "@src/vdom/virtualNode.js"
import { Context } from "esbehavior"

export class RenderApp {
  private unmount: (() => void) | undefined
  private render: DOMRenderer
  private current: Node | undefined

  constructor() {
    this.render = createDOMRenderer()
  }

  mount(vnode: VirtualNode) {
    const base = document.createElement("div")
    document.querySelector("#test-display")?.appendChild(base)

    const renderResult = this.render(base, vnode)
    this.current = renderResult.root
    this.unmount = () => {
      renderResult.root.parentNode?.removeChild(renderResult.root)
    }
  }

  patch(vnode: VirtualNode) {
    const result = this.render(this.current!, vnode)
    this.current = result.root
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
