import { GetState } from "../../../store/index.js"
import { StateEffect, Stateful, StateListenerType } from "../../../store/tokenRegistry.js"

export class UpdateTextEffect implements StateEffect {
  readonly type = StateListenerType.SystemEffect

  constructor(private generator: Stateful<string>) { }

  init(get: GetState, node: Node): void {
    node.nodeValue = this.generator(get) ?? ""
  }

  run(get: GetState, node: Node): void {
    if (!node.isConnected) {
      return
    }

    node.nodeValue = this.generator(get) ?? ""
  }
}
