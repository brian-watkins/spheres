import { Value, GetState } from "./store.js";

export interface ValueInitializer<T, M> {
  query: (get: GetState, current: T | undefined) => M
  reducer?: (message: M, current: T | undefined) => T
}

export function value<M, T = M>(initializer: ValueInitializer<T, M>): Value<T, M> {
  const reducer = initializer.reducer ?? ((val: any) => val)
  return new Value(initializer.query, reducer)
}
