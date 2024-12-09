import { GetState } from "../../../store/index.js";
import { IdSequence } from "../idSequence.js";
import { ArgsController, DOMTemplate, GetDOMTemplate, Zone } from "../index.js";
import { StatefulSelectorNode, VirtualTemplate } from "../virtualNode.js";
import { activateTemplateInstance, renderTemplateInstance } from "../renderTemplate.js";
import { EffectWithArgs } from "./effectWithArgs.js";

interface TemplateInfo {
  domTemplate: DOMTemplate,
  nextArgsController: ArgsController
}

export class SelectViewEffect extends EffectWithArgs {

  constructor(
    private zone: Zone,
    private vnode: StatefulSelectorNode,
    public startNode: Node,
    public endNode: Node,
    argsController: ArgsController | undefined,
    args: any,
    private getDOMTemplate: GetDOMTemplate
  ) {
    super(argsController, args)
  }

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
    const templateInfo = this.getTemplateInfo(get)

    if (templateInfo === undefined) return

    activateTemplateInstance(this.zone, templateInfo.domTemplate, this.startNode.nextSibling!, templateInfo.nextArgsController, undefined)
  }

  private switchView(get: GetState): void {
    const templateInfo = this.getTemplateInfo(get)

    let node: Node
    if (templateInfo === undefined) {
      node = document.createTextNode("")
    } else {
      node = renderTemplateInstance(this.zone, templateInfo.domTemplate, templateInfo.nextArgsController, undefined)
    }

    this.clearView()

    this.startNode.parentNode?.insertBefore(node, this.endNode!)
  }

  private getTemplateInfo(get: GetState): TemplateInfo | undefined {
    this.setArgs()
    const selectedIndex = this.vnode.selectors.findIndex(selector => selector.select(get))

    if (selectedIndex === -1) {
      return undefined
    }

    const virtualTemplate = this.vnode.selectors[selectedIndex].template
    const domTemplate = this.getDOMTemplate(this.zone, new IdSequence(`${this.vnode.id}.${selectedIndex}`), virtualTemplate)
    const nextArgsController = this.getNextArgsController(virtualTemplate)

    return {
      domTemplate,
      nextArgsController
    }
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
      const argsController = this.argsController
      const args = this.args

      nextArgsController = {
        setArgs: (nextArgs) => {
          argsController.setArgs(args)
          template.setArgs(nextArgs)
        },
      }
    }
    return nextArgsController
  }
}
