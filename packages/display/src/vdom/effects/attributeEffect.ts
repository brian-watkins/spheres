import { Effect, EffectSubscription, GetState } from "@spheres/store";
import { EffectHandle } from "../virtualNode.js";
import { EffectGenerator } from "./effectGenerator.js";

export class UpdateAttributeEffect implements Effect, EffectHandle {
  private subscription: EffectSubscription | undefined;

  constructor(private element: Element, private attribute: string, private generator: EffectGenerator<string | undefined>, private context: any = undefined) { }

  onSubscribe(subscription: EffectSubscription): void {
    this.subscription = subscription
  }

  unsubscribe(): void {
    this.subscription?.unsubscribe()
  }

  init(get: GetState): void {
    const val = this.generator(get, this.context)
    if (val !== undefined) {
      this.element.setAttribute(this.attribute, val)
    }
  }

  run(get: GetState): void {
    if (!this.element.isConnected) {
      this.unsubscribe()
      return
    }

    const val = this.generator(get, this.context)
    if (val === undefined) {
      this.element.removeAttribute(this.attribute)
    } else {
      this.element.setAttribute(this.attribute, val)
    }
  }
}
