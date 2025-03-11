import { GetState } from "../../../store/index.js"
import { Stateful, StateListener, TokenRegistry } from "../../../store/tokenRegistry.js"

export class UpdateTextEffect implements StateListener {
  constructor(public registry: TokenRegistry, private node: Text, private generator: Stateful<string>) { }

  init(get: GetState): void {
    console.log("Setting text", this.generator(get), this.node?.nodeValue)
    this.node.nodeValue = this.generator(get) ?? ""
  }

  run(get: GetState): void {
    if (!this.node.isConnected) {
      return
    }

    this.node.nodeValue = this.generator(get) ?? ""
  }
}
