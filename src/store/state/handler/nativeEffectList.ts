import { EffectList, Subscriber } from "../../tokenRegistry.js";

export class NativeEffectList implements EffectList {
  private viewEffects: Array<Subscriber> = []
  private elementEffects: Array<Subscriber> = []
  private userEffects: Array<Subscriber> = []

  addViewEffect(subscriber: Subscriber): void {
    this.viewEffects.push(subscriber)
  }

  addElementEffect(subscriber: Subscriber) {
    this.elementEffects.push(subscriber)
  }

  addUserEffect(subscriber: Subscriber) {
    this.userEffects.push(subscriber)
  }

  *[Symbol.iterator]() {
    yield* this.viewEffects
    yield* this.elementEffects
    yield* this.userEffects
  }
}
