import { StateBatch, StatePublisher } from "../../tokenRegistry.js"
import { NativeEffectList } from "./nativeEffectList.js"
import { SubscriberSet } from "./subscriberSet.js"

export class Publisher<T> extends SubscriberSet implements StatePublisher<T> {
  constructor(private value: T) {
    super()
  }

  publish(value: T, batch?: StateBatch) {
    if (Object.is(this.value, value)) return

    this.value = value

    if (batch !== undefined) {
      batch.add(this)
      return
    }

    const effects = new NativeEffectList()
    this.notifyListeners(effects)

    this.runListeners()

    this.runEffects(effects)
  }

  getValue(): T {
    return this.value
  }
}
