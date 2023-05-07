import { DerivedState, GetState } from "./store.js";

export function derived<T>(derivation: (get: GetState) => T): DerivedState<T> {
  return new DerivedState(derivation)
}
