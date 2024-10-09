import { GetState, ReactiveEffect } from "../../../store/index.js"
import { IdentifierGenerator } from "../idGenerator.js"
import { DOMNodeRenderer, Zone } from "../render.js"
import { VirtualNode } from "../virtualNode.js"
import { EffectGenerator } from "./effectGenerator.js"

export class StatefulViewEffect implements ReactiveEffect {
  private currentNode!: Node

  constructor(private zone: Zone, placeholderNode: Node | undefined, private generator: EffectGenerator<VirtualNode>, private createNode: DOMNodeRenderer, private context: any = undefined) {
    if (placeholderNode) {
      this.currentNode = placeholderNode
    }
  }

  get node(): Node {
    return this.currentNode
  }

  init(get: GetState) {
    const initialVNode = this.generator(get, this.context)
    const nextNode = this.createNode(this.zone, new IdentifierGenerator("NOT DONE YET"), initialVNode)
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
    const nextNode = this.createNode(this.zone, new IdentifierGenerator("NOT DONE YET"), nextVNode)
    this.currentNode.parentNode!.replaceChild(nextNode, this.currentNode)
    this.currentNode = nextNode
  }
}
