import { Effect, GetState } from "@spheres/store"
import { Stateful } from "../virtualNode.js"

export class UpdateTextEffect implements Effect {
  constructor(private node: Text, private generator: Stateful<string>) { }

  init(get: GetState): void {
    this.node.data = this.generator(get) ?? ""
  }

  run(get: GetState): void {
    if (!this.node.isConnected) {
      return
    }

    this.node.data = this.generator(get) ?? ""
  }
}
