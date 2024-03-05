import { Effect, GetState } from "@spheres/store"
import { EffectGenerator } from "./effectGenerator.js"

export class UpdateTextEffect implements Effect {
  constructor(private node: Text, private generator: EffectGenerator<string | undefined>, private context?: any) { }

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
