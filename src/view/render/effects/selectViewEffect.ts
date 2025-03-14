import { GetState } from "../../../store/index.js";
import { DOMTemplate } from "../domTemplate.js";
import { StateListener, TokenRegistry } from "../../../store/tokenRegistry.js";
import { TemplateSelector } from "../selectorBuilder.js";

export class SelectViewEffect implements StateListener {
  constructor(
    public registry: TokenRegistry,
    public selectors: Array<TemplateSelector<DOMTemplate>>,
    public startNode: Node,
    public endNode: Node,
  ) { }

  init(get: GetState): void {
    if (this.startNode.nextSibling !== this.endNode) {
      this.activateView(get)
    } else {
      this.switchView(get)
    }
  }

  run(get: GetState): void {
    if (!this.startNode?.isConnected) {
      return
    }

    this.switchView(get)
  }

  private activateView(get: GetState): void {
    const template = this.selectTemplate(get)

    if (template === undefined) return

    template.activate(this.registry, this.startNode.nextSibling!)
  }

  private switchView(get: GetState): void {
    const template = this.selectTemplate(get)

    let node: Node
    if (template === undefined) {
      node = document.createTextNode("")
    } else {
      node = template.render(this.registry)
    }

    this.clearView()

    this.startNode.parentNode?.insertBefore(node, this.endNode!)
  }

  private selectTemplate(get: GetState): DOMTemplate | undefined {
    const selectedIndex = this.selectors.findIndex(selector => selector.select(get))

    if (selectedIndex === -1) {
      return undefined
    }

    return this.selectors[selectedIndex].template()
  }

  private clearView() {
    const range = new Range()
    range.setStartAfter(this.startNode!)
    range.setEndBefore(this.endNode!)
    range.deleteContents()
  }
}
