import { QueryActions, Container } from "./store.js"

export interface ContainerInitializer<T, M> {
  initialValue: T,
  query?: (actions: QueryActions<T>, next?: M) => M
  reducer?: (message: M, current: T) => T
}

export function container<T, M = T>(initializer: ContainerInitializer<T, M>): Container<T, M> {
  const reducer = initializer.reducer ?? ((val: any) => val)
  return new Container(initializer.initialValue, reducer, initializer.query)
}
