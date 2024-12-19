import { GetState } from "../../../store/index.js";
import { IdSequence } from "../idSequence.js";
import { DOMTemplate, GetDOMTemplate, Zone } from "../index.js";
import { StatefulSelectorNode } from "../virtualNode.js";
import { activateTemplateInstance, renderTemplateInstance } from "../renderTemplate.js";
import { TokenRegistry } from "../../../store/store.js";

export class SelectViewEffect {
  constructor(
    private zone: Zone,
    private registry: TokenRegistry,
    private vnode: StatefulSelectorNode,
    public startNode: Node,
    public endNode: Node,
    private getDOMTemplate: GetDOMTemplate
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
    const selectedIndex = this.vnode.selectors.findIndex(selector => selector.select(get))

    if (selectedIndex === -1) {
      return undefined
    }

    return this.getDOMTemplate(
      this.zone,
      new IdSequence(`${this.vnode.id}.${selectedIndex}`),
      this.vnode.selectors[selectedIndex].template
    )
  }

  private clearView() {
    const range = new Range()
    range.setStartAfter(this.startNode!)
    range.setEndBefore(this.endNode!)
    range.deleteContents()
  }
}
