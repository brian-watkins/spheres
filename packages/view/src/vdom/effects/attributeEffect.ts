import { GetState, ReactiveEffect } from "@spheres/store";
import { EffectGenerator } from "./effectGenerator.js";

export class UpdateAttributeEffect implements ReactiveEffect {
  constructor(private element: Element, private attribute: string, private generator: EffectGenerator<string | undefined>, private context: any = undefined) { }

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
