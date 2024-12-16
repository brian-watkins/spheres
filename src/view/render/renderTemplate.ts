import { DOMTemplate, spheresTemplateData, Zone } from "./index.js"

export function renderTemplateInstance(zone: Zone, domTemplate: DOMTemplate) {
  const fragment = domTemplate.element.content.cloneNode(true)

  for (const effect of domTemplate.effects) {
    effect.attach(zone, fragment.firstChild!)
  }

  if (domTemplate.isFragment) {
    return fragment
  }

  const rootElement = fragment.firstChild!

  // @ts-ignore
  rootElement[spheresTemplateData] = zone.store

  return rootElement
}

export function activateTemplateInstance(zone: Zone, domTemplate: DOMTemplate, root: Node) {
  for (const effect of domTemplate.effects) {
    effect.attach(zone, root)
  }

  if (!domTemplate.isFragment) {
    // @ts-ignore
    root[spheresTemplateData] = zone.store
  }
}