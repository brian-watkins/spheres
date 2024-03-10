import { Effect, GetState, Store } from "@spheres/store"
import { patch, virtualize } from "../renderToDom.js"
import { VirtualNode } from "../virtualNode.js"

export interface NodeReference {
  node: Node | undefined
}

export class PatchZoneEffect implements Effect {
  private current: VirtualNode | null = null

  constructor(private store: Store, placeholderNode: Node | undefined, private generator: (get: GetState) => VirtualNode, private nodeReference: NodeReference) {
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
    this.current = patch(this.store, this.current, this.generator(get))
    this.nodeReference.node = this.node
  }
}
