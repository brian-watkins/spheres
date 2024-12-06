import { DerivedState, GetState } from "./store.js";

export interface DerivedStateInitializer<T> {
  id?: string
  query: (get: GetState) => T
  name?: string
}

export function derived<T>(initializer: DerivedStateInitializer<T>): DerivedState<T> {
  return new DerivedState(initializer.id, initializer.name, initializer.query)
}
