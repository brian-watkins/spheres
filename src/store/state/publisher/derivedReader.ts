import { GetState, StateDerivation, StateListenerType, StateReader } from "../../tokenRegistry.js"
import { SubscriberSet } from "./subscriberSet.js"

export class DerivedStateReader<T> extends SubscriberSet implements StateReader<T>, StateDerivation {
  readonly type = StateListenerType.Derivation
  private _value!: T

  constructor(private derivation: (get: GetState) => T) {
    super()
  }

  init(get: GetState): void {
    this._value = this.derivation(get)
  }

  run(get: GetState): void {
    const derived = this.derivation(get)

    if (Object.is(derived, this._value)) {
      return
    }

    this._value = derived

    this.runListeners()
  }

  getValue(): T {
    return this._value
  }
}