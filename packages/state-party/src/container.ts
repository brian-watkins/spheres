import { QueryActions, Container, WriteMessage } from "./store.js"

class ContainerInitializer<T, M = T> {
  public query: ((actions: QueryActions<T>, next?: M) => M) | undefined

  constructor (public initialValue: T, public reducer: (message: M, current: T) => T) { }

  withQuery(definition: (actions: QueryActions<T>, next?: M) => M): ContainerInitializer<T, M> {
    this.query = definition
    return this
  }
}

export function withInitialValue<T>(initialValue: T): ContainerInitializer<T> {
  return new ContainerInitializer(initialValue, (val) => val)
}

export function withReducer<T, M>(initialValue: T, reducer: (message: M, current: T) => T): ContainerInitializer<T, M> {
  return new ContainerInitializer(initialValue, reducer)
}

export function container<T, M = T>(initializer: ContainerInitializer<T, M>): Container<T, M> {
  return new Container(initializer.initialValue, initializer.reducer, initializer.query)
}

export function write<T, M = T>(container: Container<T, M>, value: M): WriteMessage<T, M> {
  return {
    type: "write",
    token: container,
    value
  }
} 
