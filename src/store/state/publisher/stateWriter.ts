import { ImmutableStatePublisher, ListenerNode } from "../../tokenRegistry.js"

export abstract class StateWriter<T, M = T> extends ImmutableStatePublisher<T> {
  protected oldValue: T | undefined

  constructor(protected currentValue: T) {
    super()
  }

  abstract write(value: M): void

  publish(value: T) {
    if (Object.is(this.currentValue, value)) return

    this.currentValue = value

    const userEffects: Array<ListenerNode> = []

    this.notifyListeners(userEffects)

    this.runListeners()

    this.runUserEffects(userEffects)
  }

  getValue(): T {
    return this.currentValue
  }
}
