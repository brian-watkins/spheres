import { Value, GetState } from "./store.js";

export function value<T>(derivation: (get: GetState, current: T | undefined) => T): Value<T> {
  return new Value(derivation)
}
