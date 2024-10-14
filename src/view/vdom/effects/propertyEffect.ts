import { GetState, ReactiveEffect } from "../../../store/index.js";
import { Stateful } from "../virtualNode.js";
import { EffectGenerator } from "./effectGenerator.js";

export class UpdatePropertyEffect implements ReactiveEffect {
  constructor(private element: Element, private property: string, private generator: Stateful<string>) { }

  init(get: GetState): void {
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

    // @ts-ignore
    this.element[this.property] = this.generator(get) ?? ""
  }
}
