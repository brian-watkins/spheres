import { WritableState } from "../message.js"
import { container } from "./container.js"

export interface SuppliedStateInitializer<T> {
  name?: string
  initialValue: T
}

export type SuppliedState<T, E = any> = WritableState<T, never, E>

export function supplied<T, E = any>(initializer: SuppliedStateInitializer<T>): SuppliedState<T, E> {
  return container<T, never, E>({
    initialValue: initializer.initialValue,
    name: initializer.name
  })
}