import { RuleActions, Container, WriteMessage } from "./store.js"

export interface ContainerInitializer<T, M> {
  initialValue: T,
  rule?: (actions: RuleActions<T>, next?: M) => M
  reducer?: (message: M, current: T) => T
}

export function container<T, M = T>(initializer: ContainerInitializer<T, M>): Container<T, M> {
  const reducer = initializer.reducer ?? ((val: any) => val)
  return new Container(initializer.initialValue, reducer, initializer.rule)
}

export function write<T, M = T>(container: Container<T, M>, value: M): WriteMessage<T, M> {
  return {
    type: "write",
    token: container,
    value
  }
} 
