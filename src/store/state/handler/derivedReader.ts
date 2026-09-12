import { GetState, StateDerivation, StateListenerType, StateReader } from "../../tokenRegistry.js"
import { Reconciler } from "../reconciler.js"
import { SubscriberSet } from "./subscriberSet.js"

export class DerivedStateReader<T> extends SubscriberSet implements StateReader<T>, StateDerivation {
  readonly type = StateListenerType.Derivation
  private _value!: T

  constructor(private derivation: (get: GetState) => T, private reconciler?: Reconciler<T>) {
    super()
  }

  init(get: GetState): void {
    this._value = this.derivation(get)
  }

  run(get: GetState): void {
    const derived = this.derivation(get)

    const reconciled = this.reconciler !== undefined ?
      this.reconciler(this._value, derived) :
      derived

    if (Object.is(reconciled, this._value)) {
      this.notifyStable()
      return
    }

    this._value = reconciled

    this.runSubscribers()
  }

  getValue(): T {
    return this._value
  }
}
