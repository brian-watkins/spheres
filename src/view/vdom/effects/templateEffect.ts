import { ArgsController, DOMTemplate, NodeReference, spheresTemplateData, Zone } from "../render"

export class TemplateEffect {
  constructor (protected zone: Zone) { }
  
  renderTemplateInstance(domTemplate: DOMTemplate, argsController: ArgsController, args: any, nodeReference?: NodeReference) {
    const fragment = domTemplate.element.content.cloneNode(true)
    
    for (const effect of domTemplate.effects) {
      effect.attach(this.zone, fragment.firstChild!, argsController, args, nodeReference)
    }

    const rootElement = fragment.firstChild!

    // @ts-ignore
    rootElement[spheresTemplateData] = () => argsController.setArgs(args)

    return rootElement
  }
}