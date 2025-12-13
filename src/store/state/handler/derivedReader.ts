import { GetState, runQuery, StateDerivation, StateListenerType, StateReader, Subscriber, TokenRegistry } from "../../tokenRegistry.js"
import { SubscriberSet } from "./subscriberSet.js"

export class DerivedStateReader<T> extends SubscriberSet implements StateReader<T>, StateDerivation {
  readonly type = StateListenerType.Derivation
  private _value!: T
  public isDirty: boolean = false

  constructor(private registry: TokenRegistry, private derivation: (get: GetState) => T) {
    super()
  }

  notifyListeners(userEffects: Array<Subscriber>): void {
    this.isDirty = true
    super.notifyListeners(userEffects)
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
    this.isDirty = false

    this.runListeners()
  }

  getValue(): T {
    if (this.isDirty) {
      return runQuery(this.registry, this.derivation)
    }
    return this._value
  }
}