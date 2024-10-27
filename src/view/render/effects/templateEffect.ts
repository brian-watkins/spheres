import { ArgsController, DOMTemplate, spheresTemplateData, Zone } from "../index.js"

export class TemplateEffect {
  constructor (protected zone: Zone) { }

  renderTemplateInstance(domTemplate: DOMTemplate, argsController: ArgsController, args: any) {
    const fragment = domTemplate.element.content.cloneNode(true)

    for (const effect of domTemplate.effects) {
      effect.attach(this.zone, fragment.firstChild!, argsController, args)
    }

    if (domTemplate.isFragment) {
      return fragment
    }

    const rootElement = fragment.firstChild!

    // @ts-ignore
    rootElement[spheresTemplateData] = () => argsController.setArgs(args)

    return rootElement
  }
}
