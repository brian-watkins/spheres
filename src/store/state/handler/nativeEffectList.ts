import { EffectList, Subscriber } from "../../tokenRegistry.js";

export class NativeEffectList implements EffectList {
  private systemEffects: Array<Subscriber> = []
  private userEffects: Array<Subscriber> = []

  addSystemEffect(subscriber: Subscriber) {
    this.systemEffects.push(subscriber)
  }

  addUserEffect(subscriber: Subscriber) {
    this.userEffects.push(subscriber)
  }

  *[Symbol.iterator]() {
    yield* this.systemEffects;
    yield* this.userEffects;
  }
}
