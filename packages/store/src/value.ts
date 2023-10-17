import { Value, GetState } from "./store.js";

export interface ValueInitializer<T, M> {
  query: (get: GetState, current: T | undefined) => M
  reducer?: (message: M, current: T | undefined) => T
  name?: string
}

export function value<M, T = M>(initializer: ValueInitializer<T, M>): Value<T, M> {
  return new Value(initializer.name, initializer.query, initializer.reducer)
}
