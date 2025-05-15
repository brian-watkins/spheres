import { GetState } from "../../../store/index.js"
import { Stateful, StateListener, StateListenerType, TokenRegistry } from "../../../store/tokenRegistry.js"

export class UpdateTextEffect implements StateListener {
  readonly type = StateListenerType.SystemEffect

  constructor(public registry: TokenRegistry, private node: Text, private generator: Stateful<string>) { }

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
