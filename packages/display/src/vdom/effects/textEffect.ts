import { Effect, GetState } from "@spheres/store"
import { Stateful } from "../virtualNode"

export class UpdateTextEffect implements Effect {
  constructor(private node: Text, private generator: Stateful<string>, private context: any = undefined) { }

  init(get: GetState): void {
    this.node.data = this.generator(get, this.context) ?? ""
  }

  run(get: GetState): void {
    if (!this.node.isConnected) {
      return
    }

    this.node.data = this.generator(get, this.context) ?? ""
  }
}
