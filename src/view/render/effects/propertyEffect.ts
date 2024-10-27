import { GetState, ReactiveEffect } from "../../../store/index.js";
import { ArgsController } from "../index.js";
import { Stateful } from "../virtualNode.js";

export class UpdatePropertyEffect implements ReactiveEffect {
  constructor(private element: Element, private property: string, private generator: Stateful<string>, private argsController: ArgsController | undefined, private args: any) { }

  init(get: GetState): void {
    this.argsController?.setArgs(this.args)
    const val = this.generator(get)
    if (val !== undefined) {
      //@ts-ignore
      this.element[this.property] = val
    }
  }

  run(get: GetState): void {
    if (!this.element.isConnected) {
      return
    }

    this.argsController?.setArgs(this.args)
    // @ts-ignore
    this.element[this.property] = this.generator(get) ?? ""
  }
}
