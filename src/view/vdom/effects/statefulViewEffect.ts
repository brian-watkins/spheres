import { GetState, ReactiveEffect } from "../../../store/index.js"
import { IdentifierGenerator } from "../idGenerator.js"
import { DOMNodeRenderer, Zone } from "../render.js"
import { StatefulNode, VirtualNode } from "../virtualNode.js"
import { EffectGenerator } from "./effectGenerator.js"

export class StatefulViewEffect implements ReactiveEffect {
  private currentNode!: Node

  constructor(private zone: Zone, private vnode: StatefulNode, placeholderNode: Node | undefined, private generator: EffectGenerator<VirtualNode>, private createNode: DOMNodeRenderer, private context: any = undefined) {
    if (placeholderNode) {
      this.currentNode = placeholderNode
    }
  }

  get node(): Node {
    return this.currentNode
  }

  init(get: GetState) {
    const initialVNode = this.generator(get, this.context)
    const nextNode = this.createNode(this.zone, new IdentifierGenerator(this.vnode.id), initialVNode)
    if (this.currentNode) {
      this.currentNode.parentNode!.replaceChild(nextNode, this.currentNode)
    }
    this.currentNode = nextNode
  }

  run(get: GetState) {
    if (!this.currentNode.isConnected) {
      return
    }

    const nextVNode = this.generator(get, this.context)
    // this will just create the node
    // but that means that any events will be normal element events
    // so if we're inside a template we need to know that and do
    // something different
    const nextNode = this.createNode(this.zone, new IdentifierGenerator(this.vnode.id), nextVNode)
    this.currentNode.parentNode!.replaceChild(nextNode, this.currentNode)
    this.currentNode = nextNode
  }
}
