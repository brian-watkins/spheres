import { GetState } from "../../../store/index.js"
import { Stateful, StateListener, StateListenerType } from "../../../store/tokenRegistry.js"
import { EffectLocation } from "../effectLocation.js"

export class UpdateTextEffect implements StateListener {
  readonly type = StateListenerType.SystemEffect

  constructor(private location: EffectLocation, private generator: Stateful<string>) { }

  init(get: GetState, root: Node): void {
    const node = this.location.findNode(root)
    node.nodeValue = this.generator(get) ?? ""
  }

  run(get: GetState, root: Node): void {
    const node = this.location.findNode(root)

    if (!node.isConnected) {
      return
    }

    node.nodeValue = this.generator(get) ?? ""
  }
}
