import { GetState, ReactiveQuery } from "@spheres/store"
import { EffectGenerator } from "./effectGenerator.js"

export class UpdateTextEffect extends ReactiveQuery {
  constructor(private node: Text, private generator: EffectGenerator<string | undefined>, private context?: any) {
    super()
  }

  init(get: GetState): void {
    this.node.nodeValue = this.generator(get, this.context) ?? ""
  }

  run(get: GetState): void {
    if (!this.node.isConnected) {
      return
    }

    this.node.nodeValue = this.generator(get, this.context) ?? ""
  }
}
