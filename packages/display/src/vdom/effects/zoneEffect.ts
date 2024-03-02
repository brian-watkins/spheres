import { Effect, GetState, Store } from "@spheres/store"
import { patch, virtualize } from "../renderToDom.js"
import { VirtualNode } from "../virtualNode.js"
import { EffectGenerator } from "./effectGenerator.js"

export class PatchZoneEffect implements Effect {
  private current: VirtualNode | null = null

  constructor(private store: Store, placeholderNode: Node | undefined, private generator: EffectGenerator<VirtualNode>, private context: any = undefined) {
    if (placeholderNode !== undefined) {
      this.current = virtualize(placeholderNode)
    }
  }

  get node(): Node {
    return this.current!.node!
  }

  init(get: GetState): void {
    this.current = patch(this.store, this.current, this.generator(get, this.context))
  }

  run(get: GetState): void {
    if (!this.node?.isConnected) {
      return
    }

    this.current = patch(this.store, this.current, this.generator(get, this.context))
  }
}
