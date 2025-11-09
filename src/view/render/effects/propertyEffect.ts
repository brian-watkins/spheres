import { GetState } from "../../../store/index.js";
import { StateEffect, Stateful, StateListenerType } from "../../../store/tokenRegistry.js";

export class UpdatePropertyEffect implements StateEffect {
  readonly type = StateListenerType.SystemEffect

  constructor(private property: string, private generator: Stateful<any>) { }

  init(get: GetState, element: Node): void {
    const val = this.generator(get)
    if (val !== undefined) {
      //@ts-ignore
      element[this.property] = val
    }
  }

  run(get: GetState, element: Node): void {
    if (!element.isConnected) {
      return
    }

    // @ts-ignore
    element[this.property] = this.generator(get) ?? ""
  }
}
