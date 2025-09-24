import { GetState } from "../../../store/index.js";
import { Stateful, StateListener, StateListenerType } from "../../../store/tokenRegistry.js";
import { EffectLocation } from "../effectLocation.js";

export class UpdatePropertyEffect implements StateListener {
  readonly type = StateListenerType.SystemEffect

  constructor(private location: EffectLocation, private property: string, private generator: Stateful<any>) { }

  init(get: GetState, root: Node): void {
    const val = this.generator(get)
    if (val !== undefined) {
      const element = this.location.findNode(root)
      //@ts-ignore
      element[this.property] = val
    }
  }

  run(get: GetState, root: Node): void {
    const element = this.location.findNode(root)
    if (!element.isConnected) {
      return
    }

    // @ts-ignore
    element[this.property] = this.generator(get) ?? ""
  }
}
