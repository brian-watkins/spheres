import { GetState, ReactiveEffect } from "../../../store";
import { IdentifierGenerator } from "../idGenerator";
import { NodeReference, TemplateNodeRenderer, UseWithArgs, Zone } from "../render";
import { StatefulSwitchNode } from "../virtualNode";

export class SwitchViewEffect implements ReactiveEffect {
  // private current: Node | undefined

  constructor(
    private zone: Zone,
    private id: string,
    private statefulGenerator: UseWithArgs<any, any>,
    private vnode: StatefulSwitchNode,
    // placeholder: Node | undefined,
    private nodeReference: NodeReference,
    private createTemplateInstance: TemplateNodeRenderer,
    private context: any
  ) {
    // this.vnode.node = placeholder
  }

  get node(): Node {
    return this.nodeReference.node!
  }

  init(get: GetState): void {
    console.log("Init switch view effect!")
    // Note that this would need to be wrapped to use parent template state
    const key = this.vnode.selector(get)
    let node
    if (key === undefined) {
      node = document.createTextNode("")
    } else {
      const template = this.vnode.views[key]
      // here we might need to wrap the template somehow? so that it's useWithArgs
      // function takes into account the parent
      // So create template instance needs something here ... maybe an ability
      // to wrap stateful values with an arg?
      const generator: UseWithArgs<any, any> = (gen) => () => {
        //@ts-ignore
        return this.statefulGenerator(template.useWithConsumedArgs(gen)())(this.context)
        // return generator(gen)(args)
      }
      node = this.createTemplateInstance(this.zone, new IdentifierGenerator(`${this.id}.${key}`), generator, this.nodeReference, { template, args: undefined })  
    }
    if (this.nodeReference.node) {
      this.node.parentNode!.replaceChild(node, this.node)
    } else {
      console.log("NODE REFERENCE IS NULL")
    }
    this.nodeReference.node = node
  }
  
  run(get: GetState): void {
    console.log("Run switch view effect!")
    // Could we write a test for this?
    if (!this.node.isConnected) {
      return
    }

    const key = this.vnode.selector(get)
    let node
    if (key === undefined) {
      node = document.createTextNode("")
    } else {
      const template = this.vnode.views[key]

      const generator: UseWithArgs<any, any> = (gen) => () => {
        //@ts-ignore
        return this.statefulGenerator(template.useWithConsumedArgs(gen)())(this.context)
        // return generator(gen)(args)
      }

      node = this.createTemplateInstance(this.zone, new IdentifierGenerator(`${this.id}.${key}`), generator, this.nodeReference, { template, args: undefined })
    }
    this.node.parentNode!.replaceChild(node, this.node)
    this.nodeReference.node = node
  }

}