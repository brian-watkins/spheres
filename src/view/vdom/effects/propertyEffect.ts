import { GetState, ReactiveEffect } from "@spheres/store";
import { EffectGenerator } from "./effectGenerator.js";

export class UpdatePropertyEffect implements ReactiveEffect {
  constructor(private element: Element, private property: string, private generator: EffectGenerator<string | undefined>, private context: any = undefined) { }

  init(get: GetState): void {
    const val = this.generator(get, this.context)
    if (val !== undefined) {
      //@ts-ignore
      this.element[this.property] = val
    }
  }

  run(get: GetState): void {
    if (!this.element.isConnected) {
      return
    }

    // @ts-ignore
    this.element[this.property] = this.generator(get, this.context) ?? ""
  }
}
