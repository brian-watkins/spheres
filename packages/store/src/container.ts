import { QueryActions, Container } from "./store.js"

export interface ContainerInitializer<T, M> {
  id?: string,
  initialValue: T,
  query?: (actions: QueryActions<T>, next?: M) => M
  reducer?: (message: M, current: T) => T
  name?: string
}

export function container<T, M = T, E = any>(initializer: ContainerInitializer<T, M>): Container<T, M, E> {
  return new Container(
    initializer.id,
    initializer.name,
    initializer.initialValue,
    initializer.reducer,
    initializer.query
  )
}
