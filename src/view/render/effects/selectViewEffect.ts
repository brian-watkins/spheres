import { GetState } from "../../../store/index.js";
import { DOMTemplate, Zone } from "../index.js";
import { activateTemplateInstance, renderTemplateInstance } from "../renderTemplate.js";
import { StateListener, TokenRegistry } from "../../../store/tokenRegistry.js";
import { TemplateSelector } from "../selectorBuilder.js";

export class SelectViewEffect implements StateListener {
  constructor(
    private zone: Zone,
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

    activateTemplateInstance(this.zone, this.registry, template, this.startNode.nextSibling!)
  }

  private switchView(get: GetState): void {
    const template = this.selectTemplate(get)

    let node: Node
    if (template === undefined) {
      node = document.createTextNode("")
    } else {
      node = renderTemplateInstance(this.zone, this.registry, template)
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
