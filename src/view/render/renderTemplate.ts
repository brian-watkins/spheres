import { TokenRegistry } from "../../store/tokenRegistry.js"
import { DOMTemplate, spheresTemplateData, Zone } from "./index.js"

export function renderTemplateInstance(zone: Zone, registry: TokenRegistry, domTemplate: DOMTemplate) {
  const fragment = domTemplate.element.content.cloneNode(true)

  for (const effect of domTemplate.effects) {
    effect.attach(zone, registry, fragment.firstChild!)
  }

  if (domTemplate.isFragment) {
    return fragment
  }

  const rootElement = fragment.firstChild!

  // @ts-ignore
  rootElement[spheresTemplateData] = registry

  return rootElement
}

export function activateTemplateInstance(zone: Zone, registry: TokenRegistry, domTemplate: DOMTemplate, root: Node) {
  for (const effect of domTemplate.effects) {
    effect.attach(zone, registry, root)
  }

  if (!domTemplate.isFragment) {
    // @ts-ignore
    root[spheresTemplateData] = registry
  }
}