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
    const template = selectTemplate(this.selectors, get)

    let node: Node
    if (template === undefined) {
      node = document.createTextNode("")
    } else {
      node = render(template, this.registry)
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

function selectTemplate(selectors: Array<TemplateSelector<DOMTemplate>>, get: GetState): DOMTemplate | undefined {
  const selectedIndex = selectors.findIndex(selector => selector.select(get))

  if (selectedIndex === -1) {
    return undefined
  }

  return selectors[selectedIndex].template()
}

export function activateSelect(registry: TokenRegistry, selectors: Array<TemplateSelector<DOMTemplate>>, startNode: Node, get: GetState): void {
  const template = selectTemplate(selectors, get)

  if (template === undefined) return

  activate(template, registry, startNode.nextSibling!)
}
