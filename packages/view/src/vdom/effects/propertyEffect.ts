import { GetState, ReactiveQuery } from "@spheres/store";
import { EffectHandle } from "../virtualNode.js";
import { EffectGenerator } from "./effectGenerator.js";

export class UpdatePropertyEffect extends ReactiveQuery implements EffectHandle {
  constructor(private element: Element, private property: string, private generator: EffectGenerator<string | undefined>, private context: any = undefined) {
    super()
  }

  init(get: GetState): void {
    const val = this.generator(get, this.context)
    if (val !== undefined) {
      //@ts-ignore
      this.element[this.property] = val
    }
  }

  run(get: GetState): void {
    if (!this.element.isConnected) {
      this.unsubscribe()
      return
    }

    // @ts-ignore
    this.element[this.property] = this.generator(get, this.context) ?? ""
  }
}
