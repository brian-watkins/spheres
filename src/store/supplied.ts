import { SuppliedState } from "./store"

export interface SuppliedStateInitializer<T> {
  id?: string
  name?: string
  initialValue: T
}

export function supplied<T, M = any, E = any>(initializer: SuppliedStateInitializer<T>): SuppliedState<T, M, E> {
  return new SuppliedState(initializer.id, initializer.name, initializer.initialValue)
}