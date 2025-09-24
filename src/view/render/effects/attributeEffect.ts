import { GetState } from "../../../store/index.js"
import { Stateful, StateListener, StateListenerType } from "../../../store/tokenRegistry.js";
import { EffectLocation } from "../effectLocation.js";

export class UpdateAttributeEffect implements StateListener {
  readonly type = StateListenerType.SystemEffect

  constructor(private location: EffectLocation, private attribute: string, private generator: Stateful<string>) { }

  init(get: GetState, root: Node): void {
    const val = this.generator(get)
    if (val !== undefined) {
      const element = this.location.findNode(root) as Element
      element.setAttribute(this.attribute, val)
    }
  }

  run(get: GetState, root: Node): void {
    const element = this.location.findNode(root) as Element
    
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
