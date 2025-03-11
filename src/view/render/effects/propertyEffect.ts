import { GetState } from "../../../store/index.js";
import { Stateful, StateListener, TokenRegistry } from "../../../store/tokenRegistry.js";

export class UpdatePropertyEffect implements StateListener {
  constructor(public registry: TokenRegistry, private element: Element, private property: string, private generator: Stateful<string | boolean>) { }

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
