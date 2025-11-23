import { Store } from "../store/index.js"
import { getTokenRegistry } from "../store/store.js"
import { HTMLBuilder, HTMLView } from "./htmlElements.js"
import { HTMLElementSupport } from "./htmlElementSupport.js"
import { clearRoot, DOMRoot } from "./render/domRoot.js"
import { initialize } from "./render/domTemplate.js"
import { EffectLocation } from "./render/effectLocation.js"
import { IdSequence } from "./render/idSequence.js"
import { DOMEventType, RenderResult } from "./render/index.js"
import { DomTemplateRenderer } from "./render/templateRenderer.js"
import { ConfigurableElement } from "./render/viewRenderer.js"
import { SVGElementAttributes, SVGElements } from "./svgElements.js"
import { SVGElementSupport } from "./svgElementSupport.js"

export * from "./htmlElements.js"
export * from "./svgElements.js"
export * from "./specialAttributes.js"
export type { ElementSupport, ElementConfigSupport, ElementConfig } from "./elementSupport.js"
export type { ConfigurableElement, UseData } from "./render/viewRenderer.js"
export type { RenderResult } from "./render/index.js"
export type { ActivationOptions, ActivatedZone, StateMap } from "./activate.js"
export { activateZone } from "./activate.js"


export function renderToDOM(store: Store, element: Element, view: HTMLView): RenderResult {
  const registry = getTokenRegistry(store)
  const root = new DOMRoot(registry, element)
  clearRoot(root)
  const renderer = new DomTemplateRenderer(new HTMLElementSupport(), root, new IdSequence(), new EffectLocation(root => root), element, DOMEventType.Element)
  view(renderer as unknown as HTMLBuilder)
  initialize(renderer.template, registry, element)

  return root
}

export function svg(builder?: (el: ConfigurableElement<SVGElementAttributes, SVGElements>) => void): HTMLView {
  return root => {
    root.element("svg", builder as (el: ConfigurableElement<any, any>) => void, new SVGElementSupport())
  }
}