import { GetState } from "../../../store/index.js"
import { StateEffect, Stateful, StateListenerType } from "../../../store/tokenRegistry.js";

export class UpdateAttributeEffect implements StateEffect {
  readonly type = StateListenerType.SystemEffect

  constructor(private attribute: string, private generator: Stateful<string>) { }

  init(get: GetState, element: Element): void {
    const val = this.generator(get)
    if (val !== undefined) {
      element.setAttribute(this.attribute, val)
    }
  }

  run(get: GetState, element: Element): void {
    if (!element.isConnected) {
      return
    }

    const val = this.generator(get)
    if (val === undefined) {
      element.removeAttribute(this.attribute)
    } else {
      element.setAttribute(this.attribute, val)
    }
  }
}
