import { GetState, ReactiveEffect, Store } from "@spheres/store"
import { patch, virtualize } from "../renderToDom.js"
import { VirtualNode } from "../virtualNode.js"
import { EffectGenerator } from "./effectGenerator.js"

export interface NodeReference {
  node: Node | undefined
}

export class PatchZoneEffect implements ReactiveEffect {
  private current: VirtualNode | null = null

  constructor(private store: Store, placeholderNode: Node | undefined, private generator: EffectGenerator<VirtualNode>, private nodeReference: NodeReference, private context: any = undefined) {
    if (placeholderNode !== undefined) {
      this.current = virtualize(placeholderNode)
    }
  }

  get node(): Node {
    return this.current!.node!
  }

  init(get: GetState): void {
    this.doPatch(get)
  }

  run(get: GetState): void {
    if (!this.node?.isConnected) {
      return
    }

    this.doPatch(get)
  }

  private doPatch(get: GetState) {
    this.current = patch(this.store, this.current, this.generator(get, this.context))
    this.nodeReference.node = this.node
  }
}
