import { GetState, ReactiveEffect } from "../../../store/index.js"
import { EffectGenerator } from "./effectGenerator.js"

export class UpdateTextEffect implements ReactiveEffect {
  constructor(private node: Text, private generator: EffectGenerator<string | undefined>, private context?: any) { }

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
