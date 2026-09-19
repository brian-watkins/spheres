import {
  GetState,
  StateDerivation,
  StateListenerType,
  StateReader,
} from "../../tokenRegistry.js"
import { Reconciler } from "../reconciler.js"
import { SubscriberSet } from "./subscriberSet.js"

export class DerivedStateReader<T>
  extends SubscriberSet
  implements StateReader<T>, StateDerivation
{
  readonly type = StateListenerType.Derivation
  private value!: T

  constructor(
    private derivation: (get: GetState) => T,
    private reconciler?: Reconciler<T>
  ) {
    super()
  }

  init(get: GetState): void {
    this.value = this.derivation(get)
  }

  run(get: GetState): void {
    const resolved = this.resolveValue(get)

    if (Object.is(resolved, this.value)) {
      this.notifyStable()
      return
    }

    this.value = resolved

    this.runSubscribers()
  }

  getValue(): T {
    return this.value
  }

  resolveValue(get: GetState): T {
    const derived = this.derivation(get)
    return this.reconciler !== undefined
      ? this.reconciler(this.value, derived)
      : derived
  }
}
