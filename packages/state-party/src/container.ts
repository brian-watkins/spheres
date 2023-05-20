import { RuleActions, Container, WriteMessage } from "./store.js"

class ContainerInitializer<T, M = T> {
  public rule: ((actions: RuleActions<T>, next?: M) => M) | undefined

  constructor (public initialValue: T, public reducer: (message: M, current: T) => T) { }

  withRule(definition: (actions: RuleActions<T>, next?: M) => M): ContainerInitializer<T, M> {
    this.rule = definition
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
  return new Container(initializer.initialValue, initializer.reducer, initializer.rule)
}

export function write<T, M = T>(container: Container<T, M>, value: M): WriteMessage<T, M> {
  return {
    type: "write",
    token: container,
    value
  }
} 
