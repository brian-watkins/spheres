import { AbstractStatePublisher } from "./abstractStatePublisher.js"
import { notifyListeners, TokenRegistry } from "../../tokenRegistry.js"

export class StateWriter<T> extends AbstractStatePublisher<T> {
  constructor(protected registry: TokenRegistry, private _value: T) {
    super(registry)
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

    this[notifyListeners]()

    this.runListeners()
  }

  getValue(): T {
    return this._value
  }
}
