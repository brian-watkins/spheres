import { GetState } from "../../../store/index.js";
import { activate, DOMTemplate, render } from "../domTemplate.js";
import { StateListener, StateListenerVersion, TokenRegistry } from "../../../store/tokenRegistry.js";
import { TemplateSelector } from "../selectorBuilder.js";

export class SelectViewEffect implements StateListener {
  version?: StateListenerVersion = 0

  constructor(
    public registry: TokenRegistry,
    public selectors: Array<TemplateSelector<DOMTemplate>>,
    public startNode: Node,
    public endNode: Node,
  ) { }

  init(get: GetState): void {
    this.switchView(get)
  }

  run(get: GetState): void {
    if (!this.startNode?.isConnected) {
      return
    }

    this.switchView(get)
  }

  private switchView(get: GetState): void {
    const selector = this.selectors.find(selector => selector.select(get))

    let node: Node
    if (selector === undefined) {
      node = document.createTextNode("")
    } else {
      switch (selector.type) {
        case "case-selector": {
          const templateContext = selector.templateContext()
          node = render(templateContext.template, templateContext.overlayRegistry(this.registry))
          break
        }
        case "condition-selector": {
          node = render(selector.template(), this.registry)
          break
        }
      }
    }

    this.clearView()

    this.startNode.parentNode?.insertBefore(node, this.endNode!)
  }

  private clearView() {
    const range = new Range()
    range.setStartAfter(this.startNode!)
    range.setEndBefore(this.endNode!)
    range.deleteContents()
  }
}

export function activateSelect(registry: TokenRegistry, selectors: Array<TemplateSelector<DOMTemplate>>, startNode: Node, get: GetState): void {
  const selector = selectors.find(selector => selector.select(get))

  if (selector === undefined) return

  switch (selector.type) {
    case "case-selector": {
      const templateContext = selector.templateContext()
      activate(templateContext.template, templateContext.overlayRegistry(registry), startNode.nextSibling!)
      break
    }
    case "condition-selector": {
      activate(selector.template(), registry, startNode.nextSibling!)
      break
    }
  }
}
