import { Store } from "../store/index.js"
import { getTokenRegistry } from "../store/store.js"
import { HTMLView } from "./htmlElements.js"
import { DOMRoot } from "./render/domRoot.js"
import { RenderResult } from "./render/index.js"

export * from "./htmlElements.js"
export * from "./svgElements.js"
export * from "./specialAttributes.js"
export type { ConfigurableElement } from "./render/viewRenderer.js"
export type { RenderResult } from "./render/index.js"

export function activateView(store: Store, element: Element, view: HTMLView): RenderResult {
  const root = new DOMRoot(getTokenRegistry(store), element)
  root.activate(view)

  return root
}

export function renderToDOM(store: Store, element: Element, view: HTMLView): RenderResult {
  const root = new DOMRoot(getTokenRegistry(store), element)
  root.mount(view)

  return root
}
