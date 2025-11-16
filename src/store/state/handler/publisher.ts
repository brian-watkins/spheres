import { StatePublisher, Subscriber } from "../../tokenRegistry.js"
import { SubscriberSet } from "./subscriberSet.js"

export class Publisher<T> extends SubscriberSet implements StatePublisher<T> {
  constructor(private value: T) {
    super()
  }

  publish(value: T) {
    if (Object.is(this.value, value)) return

    this.value = value

    const userEffects: Array<Subscriber> = []
    this.notifyListeners(userEffects)

    this.runListeners()

    this.runUserEffects(userEffects)
  }

  getValue(): T {
    return this.value
  }
}
