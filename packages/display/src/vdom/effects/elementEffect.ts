import { Effect, GetState, Store } from "@spheres/store"
import { patch } from "../renderToDom"
import { VirtualNode } from "../virtualNode"

export class PatchElementEffect implements Effect {
  private current!: VirtualNode

  constructor(private store: Store, private generator: (get: GetState) => VirtualNode) { }

  get node(): Node {
    return this.current!.node!
  }

  init(get: GetState): void {
    this.current = patch(this.store, null, this.generator(get))
  }

  run(get: GetState): void {
    if (!this.node?.isConnected) {
      return
    }

    this.current = patch(this.store, this.current, this.generator(get))
  }
}
