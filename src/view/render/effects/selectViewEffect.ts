import { GetState } from "../../../store/index.js";
import { activate, DOMTemplate, render } from "../domTemplate.js";
import { StateListener, StateListenerType, StateListenerVersion, TokenRegistry } from "../../../store/tokenRegistry.js";
import { SelectorCollection, TemplateSelector } from "../selectorBuilder.js";

export class SelectViewEffect implements StateListener {
  readonly type = StateListenerType.SystemEffect
  version?: StateListenerVersion = 0
  private currentSelector: TemplateSelector<DOMTemplate> | undefined

  constructor(
    private registry: TokenRegistry,
    public selectors: SelectorCollection<DOMTemplate>,
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
    const selector = this.selectors.findSelector(get)

    if (selector === this.currentSelector) {
      return
    }

    this.currentSelector = selector

    let node: Node
    switch (selector.type) {
      case "empty": {
        node = document.createTextNode("")
        break
      }
      case "view": {
        const templateContext = selector.templateContext()
        node = render(templateContext.template, templateContext.overlayRegistry(this.registry))
        break
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

export function activateSelect(registry: TokenRegistry, selectors: SelectorCollection<DOMTemplate>, startNode: Node, get: GetState): void {
  const selector = selectors.findSelector(get)

  if (selector.type === "view") {
    const templateContext = selector.templateContext()
    activate(templateContext.template, templateContext.overlayRegistry(registry), startNode.nextSibling!)
  }
}
