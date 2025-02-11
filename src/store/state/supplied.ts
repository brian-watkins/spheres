import { container, Container } from "./container.js"

export interface SuppliedStateInitializer<T> {
  name?: string
  initialValue: T
}

export type SuppliedState<T, E = any> = Container<T, never, E>

export function supplied<T, E = any>(initializer: SuppliedStateInitializer<T>): SuppliedState<T, E> {
  return container<T, never, E>({
    initialValue: initializer.initialValue,
    name: initializer.name
  })
}
