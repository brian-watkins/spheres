import { QueryActions, Container } from "./store.js"

export interface ContainerInitializer<T, M> {
  initialValue: T,
  query?: (actions: QueryActions<T>, next?: M) => M
  reducer?: (message: M, current: T) => T
  name?: string
}

export function container<T, M = T>(initializer: ContainerInitializer<T, M>): Container<T, M> {
  return new Container(initializer.name, initializer.initialValue, initializer.reducer, initializer.query)
}
