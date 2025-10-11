import { StatePublisher, Subscriber } from "../../tokenRegistry.js"

export abstract class StateWriter<T, M = T> extends StatePublisher<T> {
  constructor(protected currentValue: T) {
    super()
  }

  abstract write(value: M): void

  publish(value: T) {
    if (Object.is(this.currentValue, value)) return

    this.currentValue = value

    const userEffects: Array<Subscriber> = []
    this.notifyListeners(userEffects)

    this.runListeners()

    this.runUserEffects(userEffects)
  }

  getValue(): T {
    return this.currentValue
  }
}
