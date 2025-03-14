import { Store } from "../store/index.js"
import { getTokenRegistry } from "../store/store.js"
import { HTMLBuilder, HTMLView } from "./htmlElements.js"
import { ActivateDomRenderer } from "./render/activateDomRenderer.js"
import { DOMRoot } from "./render/domRoot.js"
import { EffectLocation } from "./render/effectLocation.js"
import { HtmlRendererDelegate } from "./render/htmlDelegate.js"
import { IdSequence } from "./render/idSequence.js"
import { RenderResult } from "./render/index.js"
import { SvgRendererDelegate } from "./render/svgDelegate.js"
import { DomTemplateRenderer } from "./render/templateRenderer.js"
import { ConfigurableElement, ViewRenderer } from "./render/viewRenderer.js"
import { SVGElementAttributes, SVGElements } from "./svgElements.js"

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
  // const renderer = new DomRenderer(new HtmlRendererDelegate(), root, registry, new IdSequence(), element)
  const renderer = new DomTemplateRenderer(new HtmlRendererDelegate(), root, new IdSequence(), new EffectLocation(root => root), element, "element")
  view(renderer as unknown as HTMLBuilder)
  // const node = renderer.template.render(root, registry)
  renderer.template.activate(root, registry, element)
  // element.appendChild(node)

  return root
}

export function svg(builder?: (el: ConfigurableElement<SVGElementAttributes, SVGElements>) => void): HTMLView {
  return root => {
    const renderer = root as unknown as ViewRenderer
    renderer.useDelegate(new SvgRendererDelegate(), () => {
      root.element("svg", builder as (el: ConfigurableElement<any, any>) => void)
    })
  }
}