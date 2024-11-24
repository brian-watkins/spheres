import { GetState, ReactiveEffect } from "../../../store/index.js";
import { IdSequence } from "../idSequence.js";
import { ArgsController, GetDOMTemplate, Zone } from "../index.js";
import { StatefulSelectorNode, VirtualTemplate } from "../virtualNode.js";
import { renderTemplateInstance } from "../renderTemplate.js";

export class SelectViewEffect implements ReactiveEffect {

  constructor(
    private zone: Zone,
    private vnode: StatefulSelectorNode,
    public startNode: Node,
    public endNode: Node,
    private argsController: ArgsController | undefined,
    private args: any,
    private getDOMTemplate: GetDOMTemplate
  ) { }

  init(get: GetState): void {
    // NOTE -- if we are activating then we recreate the view here
    // Maybe we should just try to activate it instead? Like we do with a list?

    this.switchView(get)
  }

  run(get: GetState): void {
    if (!this.startNode?.isConnected) {
      return
    }

    this.switchView(get)
  }

  private switchView(get: GetState): void {
    this.argsController?.setArgs(this.args)
    const selectedIndex = this.vnode.selectors.findIndex(selector => selector.select(get))

    const node = this.getNodeForIndex(selectedIndex)

    this.clearView()

    this.startNode.parentNode?.insertBefore(node, this.endNode!)
  }

  private getNodeForIndex(index: number): Node {
    if (index === -1) {
      return document.createTextNode("")
    }

    const virtualTemplate = this.vnode.selectors[index].template
    const domTemplate = this.getDOMTemplate(this.zone, new IdSequence(`${this.vnode.id}.${index}`), virtualTemplate)
    const nextArgsController = this.getNextArgsController(virtualTemplate)
    return renderTemplateInstance(this.zone, domTemplate, nextArgsController, undefined)
  }

  private clearView() {
    const range = new Range()
    range.setStartAfter(this.startNode!)
    range.setEndBefore(this.endNode!)
    range.deleteContents()
  }

  private getNextArgsController(template: VirtualTemplate<any>): ArgsController {
    let nextArgsController: ArgsController
    if (this.argsController === undefined) {
      nextArgsController = template
    } else {
      nextArgsController = {
        setArgs: (nextArgs) => {
          this.argsController!.setArgs(this.args)
          template.setArgs(nextArgs)
        },
      }
    }
    return nextArgsController
  }
}