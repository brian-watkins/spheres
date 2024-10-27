import { GetState, ReactiveEffect } from "../../../store/index.js"
import { ArgsController } from "../index.js"
import { Stateful } from "../virtualNode.js"

export class UpdateTextEffect implements ReactiveEffect {
  constructor(private node: Text, private generator: Stateful<string>, private argsController: ArgsController | undefined, private args: any) { }

  init(get: GetState): void {
    this.argsController?.setArgs(this.args)
    this.node.nodeValue = this.generator(get) ?? ""
  }

  run(get: GetState): void {
    if (!this.node.isConnected) {
      return
    }

    this.argsController?.setArgs(this.args)
    this.node.nodeValue = this.generator(get) ?? ""
  }
}
