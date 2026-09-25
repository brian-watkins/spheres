import { GetState, StateDerivation, StateListenerType, StateReader } from "../../tokenRegistry.js"
import { Reconciler } from "../reconciler/reconciler.js"
import { SubscriberSet } from "./subscriberSet.js"

export class DerivedStateReader<T>
  extends SubscriberSet
  implements StateReader<T>, StateDerivation
{
  readonly type = StateListenerType.Derivation
  private value!: T

  constructor(
    private derivation: (get: GetState) => T,
    private reconciler?: Reconciler<T>,
  ) {
    super()
  }

  init(get: GetState): void {
    this.value = this.derivation(get)
  }

  run(get: GetState): void {
    const nextValue = this.calculateValue(get)

    if (Object.is(nextValue, this.value)) {
      this.notifyStable()
      return
    }

    this.value = nextValue

    this.runSubscribers()
  }

  getValue(): T {
    return this.value
  }

  private calculateValue(get: GetState): T {
    const derived = this.derivation(get)
    return this.reconciler !== undefined ? this.reconciler(this.value, derived) : derived
  }
}
