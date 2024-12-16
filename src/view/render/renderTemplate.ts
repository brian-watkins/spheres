import { Store } from "../../store/index.js"
import { DOMTemplate, spheresTemplateData, Zone } from "./index.js"

export function renderTemplateInstance(zone: Zone, store: Store, domTemplate: DOMTemplate) {
  const fragment = domTemplate.element.content.cloneNode(true)

  for (const effect of domTemplate.effects) {
    effect.attach(zone, store, fragment.firstChild!)
  }

  if (domTemplate.isFragment) {
    return fragment
  }

  const rootElement = fragment.firstChild!

  // @ts-ignore
  rootElement[spheresTemplateData] = store

  return rootElement
}

export function activateTemplateInstance(zone: Zone, store: Store, domTemplate: DOMTemplate, root: Node) {
  for (const effect of domTemplate.effects) {
    effect.attach(zone, store, root)
  }

  if (!domTemplate.isFragment) {
    // @ts-ignore
    root[spheresTemplateData] = store
  }
}