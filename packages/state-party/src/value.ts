import { Value, GetState } from "./store.js";

export function value<T>(query: (get: GetState, current: T | undefined) => T): Value<T> {
  return new Value(query)
}
