import { GetState, ReactiveQuery } from "@spheres/store";
import { EffectHandle } from "../virtualNode.js";
import { EffectGenerator } from "./effectGenerator.js";

export class UpdateAttributeEffect extends ReactiveQuery implements EffectHandle {
  constructor(private element: Element, private attribute: string, private generator: EffectGenerator<string | undefined>, private context: any = undefined) {
    super()
  }

  init(get: GetState): void {
    const val = this.generator(get, this.context)
    if (val !== undefined) {
      this.element.setAttribute(this.attribute, val)
    }
  }

  run(get: GetState): void {
    if (!this.element.isConnected) {
      return
    }

    const val = this.generator(get, this.context)
    if (val === undefined) {
      this.element.removeAttribute(this.attribute)
    } else {
      this.element.setAttribute(this.attribute, val)
    }
  }
}
