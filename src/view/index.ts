import { Store } from "../store/index.js"
import { getTokenRegistry } from "../store/store.js"
import { HTMLView } from "./htmlElements.js"
import { RenderResult } from "./render/index.js"
import { DOMRoot } from "./render/renderToDom.js"

export * from "./htmlElements.js"
export * from "./svgElements.js"
export * from "./specialAttributes.js"
export type { ConfigurableElement } from "./viewBuilder.js"
export type { RenderResult } from "./render/index.js"

export function activateView(store: Store, element: Element, view: HTMLView): RenderResult {
  // const builder = new HtmlViewBuilder()
  // view(builder as unknown as HTMLBuilder)
  // const vnode = builder.toVirtualNode()

  const root = new DOMRoot(getTokenRegistry(store), element)
  root.activate(view)

  return root
}

export function renderToDOM(store: Store, element: Element, view: HTMLView): RenderResult {
  // const renderer = new DomRenderer(getTokenRegistry(store), element)
  // view(renderer as unknown as HTMLBuilder)

  const root = new DOMRoot(getTokenRegistry(store), element)
  root.mount(view)

  return root
  // const builder = new HtmlViewBuilder()
  // view(builder as unknown as HTMLBuilder)
  // const vnode = builder.toVirtualNode()

  // const root = new DOMRoot(getTokenRegistry(store), element)
  // root.mount(vnode)

  // return root
}
