import { DerivedState, GetState } from "./store.js";

export interface DerivedStateInitializer<T> {
  query: (get: GetState, current: T | undefined) => T
  name?: string
}

export function derived<T>(initializer: DerivedStateInitializer<T>): DerivedState<T> {
  return new DerivedState(initializer.name, initializer.query)
}
