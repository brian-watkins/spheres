import { DerivedState, GetState } from "./store.js";

export function derived<T>(derivation: (get: GetState, current: T | undefined) => T): DerivedState<T> {
  return new DerivedState(derivation)
}
