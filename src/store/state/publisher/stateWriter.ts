import { StatePublisher, Subscriber } from "../../tokenRegistry.js"

export class StateWriter<T> extends StatePublisher<T> {
  constructor(private _value: T) {
    super()
  }

  write(value: any) {
    this.accept(value)
  }

  accept(value: any) {
    this.publish(value)
  }

  publish(value: T) {
    if (Object.is(this._value, value)) return

    this._value = value

    const userEffects: Array<Subscriber> = []
    this.notifyListeners(userEffects)

    this.runListeners()

    this.runUserEffects(userEffects)
  }

  getValue(): T {
    return this._value
  }
}
