import { GetState } from "../../../store/index.js"
import { ArgsController } from "../index.js";
import { Stateful } from "../virtualNode.js";
import { EffectWithArgs } from "./effectWithArgs.js";

export class UpdateAttributeEffect extends EffectWithArgs {
  constructor(private element: Element, private attribute: string, private generator: Stateful<string>, argsController: ArgsController | undefined, args: any) {
    super(argsController, args)
  }

  init(get: GetState): void {
    this.setArgs()
    const val = this.generator(get)
    if (val !== undefined) {
      this.element.setAttribute(this.attribute, val)
    }
  }

  run(get: GetState): void {
    if (!this.element.isConnected) {
      return
    }

    this.setArgs()
    const val = this.generator(get)
    if (val === undefined) {
      this.element.removeAttribute(this.attribute)
    } else {
      this.element.setAttribute(this.attribute, val)
    }
  }
}
