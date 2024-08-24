import { GetState, ReactiveEffect, Store } from "../../../store/index.js"
import { createNode } from "../renderToDom.js"
import { VirtualNode } from "../virtualNode.js"
import { EffectGenerator } from "./effectGenerator.js"

export interface NodeReference {
  node: Node | undefined
}

export class ZoneEffect implements ReactiveEffect {
  private currentNode!: Node

  constructor(private store: Store, placeholderNode: Node | undefined, private generator: EffectGenerator<VirtualNode>, _: NodeReference, private context: any = undefined) {
    if (placeholderNode) {
      this.currentNode = placeholderNode
    }
  }

  get node(): Node {
    return this.currentNode
  }

  init(get: GetState) {
    const initialVNode = this.generator(get, this.context)
    const nextNode = createNode(this.store, initialVNode)
    if (this.currentNode) {
      this.currentNode.parentNode!.replaceChild(nextNode, this.currentNode)
    }
    this.currentNode = nextNode
  }

  run(get: GetState) {
    // do we need to check if the currentNode is still connected to the DOM?

    const nextVNode = this.generator(get, this.context)
    const nextNode = createNode(this.store, nextVNode)
    this.currentNode.parentNode!.replaceChild(nextNode, this.currentNode)
    this.currentNode = nextNode
  }

}
