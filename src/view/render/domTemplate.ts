import { TokenRegistry } from "../../store/tokenRegistry.js"
import { spheresTemplateData } from "./index.js"

export interface EffectTemplate {
  attach(registry: TokenRegistry, root: Node): void
}

export enum TemplateType {
  List, Select, Other
}

export class DOMTemplate {
  readonly isFragment: boolean

  constructor(
    readonly type: TemplateType,
    readonly element: HTMLTemplateElement,
    readonly effects: Array<EffectTemplate>
  ) {
    this.isFragment = type === TemplateType.List || type === TemplateType.Select
  }

  render(registry: TokenRegistry): Node {
    const fragment = this.element.content.cloneNode(true)

    for (const effect of this.effects) {
      effect.attach(registry, fragment.firstChild!)
    }

    if (this.isFragment) {
      return fragment
    }

    const rootElement = fragment.firstChild!

    // @ts-ignore
    rootElement[spheresTemplateData] = registry

    return rootElement
  }

  activate(registry: TokenRegistry, root: Node) {
    for (const effect of this.effects) {
      effect.attach(registry, root)
    }
  
    if (!this.isFragment) {
      // @ts-ignore
      root[spheresTemplateData] = registry
    }
  }
}