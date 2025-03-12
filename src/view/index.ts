import { Store } from "../store/index.js"
import { getTokenRegistry } from "../store/store.js"
import { HTMLBuilder, HTMLView } from "./htmlElements.js"
import { ActivateDomRenderer } from "./render/activateDomRenderer.js"
import { DomRenderer } from "./render/domRenderer.js"
import { DOMRoot } from "./render/domRoot.js"
import { HtmlRendererDelegate } from "./render/htmlDelegate.js"
import { IdSequence } from "./render/idSequence.js"
import { RenderResult } from "./render/index.js"

export * from "./htmlElements.js"
export * from "./svgElements.js"
export * from "./specialAttributes.js"
export type { ConfigurableElement } from "./render/viewRenderer.js"
export type { RenderResult } from "./render/index.js"

export function activateView(store: Store, element: Element, view: HTMLView): RenderResult {
  const registry = getTokenRegistry(store)
  const root = new DOMRoot(registry, element)
  root.clean()
  const renderer = new ActivateDomRenderer(new HtmlRendererDelegate(), root, registry, element.firstChild!)
  view(renderer as unknown as HTMLBuilder)

  return root
}

export function renderToDOM(store: Store, element: Element, view: HTMLView): RenderResult {
  const registry = getTokenRegistry(store)
  const root = new DOMRoot(registry, element)
  root.clear()
  const renderer = new DomRenderer(new HtmlRendererDelegate(), root, registry, new IdSequence(), element)
  view(renderer as unknown as HTMLBuilder)

  return root
}
