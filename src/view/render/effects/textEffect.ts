import { GetState } from "../../../store/index.js"
import { Stateful } from "../virtualNode.js"

export class UpdateTextEffect {
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
