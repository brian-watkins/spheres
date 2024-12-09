import { GetState } from "../../../store/index.js"
import { ArgsController } from "../index.js"
import { Stateful } from "../virtualNode.js"
import { EffectWithArgs } from "./effectWithArgs.js"

export class UpdateTextEffect extends EffectWithArgs {
  constructor(private node: Text, private generator: Stateful<string>, argsController: ArgsController | undefined, args: any) {
    super(argsController, args)
  }

  init(get: GetState): void {
    this.setArgs()
    this.node.nodeValue = this.generator(get) ?? ""
  }

  run(get: GetState): void {
    if (!this.node.isConnected) {
      return
    }

    this.setArgs()
    this.node.nodeValue = this.generator(get) ?? ""
  }
}
