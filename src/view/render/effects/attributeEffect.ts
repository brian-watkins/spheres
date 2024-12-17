import { GetState } from "../../../store/index.js"
import { Stateful } from "../virtualNode.js";

export class UpdateAttributeEffect {
  constructor(private element: Element, private attribute: string, private generator: Stateful<string>) { }

  init(get: GetState): void {
    const val = this.generator(get)
    if (val !== undefined) {
      this.element.setAttribute(this.attribute, val)
    }
  }

  run(get: GetState): void {
    if (!this.element.isConnected) {
      return
    }

    const val = this.generator(get)
    if (val === undefined) {
      this.element.removeAttribute(this.attribute)
    } else {
      this.element.setAttribute(this.attribute, val)
    }
  }
}
