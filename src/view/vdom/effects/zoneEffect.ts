import { GetState, ReactiveEffect, Store } from "../../../store/index.js"
import { DOMNodeRenderer } from "../render.js"
import { VirtualNode } from "../virtualNode.js"
import { EffectGenerator } from "./effectGenerator.js"

export class ZoneEffect implements ReactiveEffect {
  private currentNode!: Node

  constructor(private store: Store, placeholderNode: Node | undefined, private generator: EffectGenerator<VirtualNode>, private createNode: DOMNodeRenderer, private context: any = undefined) {
    if (placeholderNode) {
      this.currentNode = placeholderNode
    }
  }

  get node(): Node {
    return this.currentNode
  }

  init(get: GetState) {
    const initialVNode = this.generator(get, this.context)
    const nextNode = this.createNode(this.store, initialVNode)
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
    const nextNode = this.createNode(this.store, nextVNode)
    this.currentNode.parentNode!.replaceChild(nextNode, this.currentNode)
    this.currentNode = nextNode
  }
}
