import { GetState, ReactiveEffect } from "../../../store";
import { IdSequence } from "../idSequence";
import { ArgsController, GetDOMTemplate, Zone } from "../render";
import { StatefulSwitchNode, VirtualTemplate } from "../virtualNode";
import { TemplateEffect } from "./templateEffect";

export class SwitchViewEffect extends TemplateEffect implements ReactiveEffect {

  constructor(
    zone: Zone,
    private vnode: StatefulSwitchNode,
    private id: string,
    public startNode: Node,
    public endNode: Node,
    private argsController: ArgsController | undefined,
    private args: any,
    private getDOMTemplate: GetDOMTemplate
  ) {
    super(zone)
  }

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
    const key = this.vnode.selector(get)

    const node = key === undefined ?
      document.createTextNode("") :
      this.getNodeForViewWithKey(key)

    this.clearView()

    this.startNode.parentNode?.insertBefore(node, this.endNode!)
  }

  private getNodeForViewWithKey(key: string): Node {
    const template = this.vnode.views[key]
    const domTemplate = this.getDOMTemplate(this.zone, new IdSequence(`${this.id}.${key}`), template)
    const nextArgsController = this.getNextArgsController(template)
    return this.renderTemplateInstance(domTemplate, nextArgsController, undefined)
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
