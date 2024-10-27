import { GetState, ReactiveEffect } from "../../../store/index.js"
import { ArgsController } from "../index.js";
import { Stateful } from "../virtualNode.js";

export class UpdateAttributeEffect implements ReactiveEffect {
  constructor(private element: Element, private attribute: string, private generator: Stateful<string>, private argsController: ArgsController | undefined, private args: any) { }

  init(get: GetState): void {
    this.argsController?.setArgs(this.args)
    const val = this.generator(get)
    if (val !== undefined) {
      this.element.setAttribute(this.attribute, val)
    }
  }

  run(get: GetState): void {
    if (!this.element.isConnected) {
      return
    }

    this.argsController?.setArgs(this.args)
    const val = this.generator(get)
    if (val === undefined) {
      this.element.removeAttribute(this.attribute)
    } else {
      this.element.setAttribute(this.attribute, val)
    }
  }
}
