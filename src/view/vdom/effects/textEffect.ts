import { GetState, ReactiveEffect } from "../../../store/index.js"
import { Stateful } from "../virtualNode.js"
import { EffectGenerator } from "./effectGenerator.js"

export class UpdateTextEffect implements ReactiveEffect {
  constructor(private node: Text, private generator: Stateful<string>) { }

  init(get: GetState): void {
    this.node.nodeValue = this.generator(get) ?? ""
  }

  run(get: GetState): void {
    if (!this.node.isConnected) {
      return
    }

    this.node.nodeValue = this.generator(get) ?? ""
  }
}
