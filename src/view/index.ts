import { Store } from "../store/index.js"
import { getTokenRegistry } from "../store/store.js"
import { HTMLBuilder, HTMLView } from "./htmlElements.js"
import { HtmlViewBuilder } from "./htmlViewBuilder.js"
import { IdSequence } from "./render/idSequence.js"
import { RenderResult } from "./render/index.js"
import { activateEffects, createNode, DOMRoot } from "./render/renderToDom.js"

export * from "./htmlElements.js"
export * from "./svgElements.js"
export * from "./specialAttributes.js"
export type { ConfigurableElement } from "./viewBuilder.js"
export type { RenderResult } from "./render/index.js"

export function activateView(store: Store, element: Element, view: HTMLView): RenderResult {
  const builder = new HtmlViewBuilder()
  view(builder as unknown as HTMLBuilder)
  const vnode = builder.toVirtualNode()

  const root = new DOMRoot(getTokenRegistry(store), element)
  // root.activate(vnode)
  root.clean()
  activateEffects(root, getTokenRegistry(store), vnode, element.firstChild!)

  return root
}

export function renderToDOM(store: Store, element: Element, view: HTMLView): RenderResult {
  const builder = new HtmlViewBuilder()
  view(builder as unknown as HTMLBuilder)
  const vnode = builder.toVirtualNode()

  const root = new DOMRoot(getTokenRegistry(store), element)
  root.clear()
  element.appendChild(createNode(root, getTokenRegistry(store), new IdSequence(), vnode))
  // root.mount(vnode)

  return root
}
