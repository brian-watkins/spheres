import { StateBatch, StatePublisher } from "../../tokenRegistry.js"
import { Reconciler } from "../reconciler.js"
import { NativeEffectList } from "./nativeEffectList.js"
import { SubscriberSet } from "./subscriberSet.js"

export class Publisher<T> extends SubscriberSet implements StatePublisher<T> {
  constructor(private value: T, private reconciler?: Reconciler<T>) {
    super()
  }

  publish(value: T, batch?: StateBatch) {
    const reconciled = this.reconciler ? this.reconciler(this.value, value) : value

    if (Object.is(this.value, reconciled)) return

    this.value = reconciled

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
