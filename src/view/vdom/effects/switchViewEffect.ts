import { GetState, ReactiveEffect } from "../../../store";
import { IdentifierGenerator } from "../idGenerator";
import { ArgsController, GetDOMTemplate, NodeReference, Zone } from "../render";
import { StatefulSwitchNode, VirtualTemplate } from "../virtualNode";
import { TemplateEffect } from "./templateEffect";

export class SwitchViewEffect extends TemplateEffect implements ReactiveEffect {

  constructor(
    zone: Zone,
    private vnode: StatefulSwitchNode,
    private id: string,
    private argsController: ArgsController | undefined,
    private args: any,
    private nodeReference: NodeReference,
    private getDOMTemplate: GetDOMTemplate
  ) {
    super(zone)
  }

  get node(): Node {
    return this.nodeReference.node!
  }

  init(get: GetState): void {
    this.switchView(get)
  }

  run(get: GetState): void {
    if (!this.node.isConnected) {
      return
    }
    this.switchView(get)
  }

  private switchView(get: GetState): void {
    const key = this.vnode.selector(get)
    let node
    if (key === undefined) {
      node = document.createTextNode("")
    } else {
      const template = this.vnode.views[key]
      const domTemplate = this.getDOMTemplate(this.zone, new IdentifierGenerator(`${this.id}.${key}`), template)
      const nextArgsController = this.getNextArgsController(template)
      node = this.renderTemplateInstance(domTemplate, nextArgsController, undefined, this.nodeReference)
    }

    if (this.nodeReference.node) {
      this.node.parentNode!.replaceChild(node, this.node)
    }
    
    this.nodeReference.node = node
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