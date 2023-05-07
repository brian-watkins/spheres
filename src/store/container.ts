import { Container, WriteMessage } from "./store.js"

interface ContainerInitializer<T, M = T> {
  initialValue: T,
  reducer: (message: M, current: T) => T
}

export function withInitialValue<T>(value: T): ContainerInitializer<T> {
  return {
    initialValue: value,
    reducer: (val) => val
  }
}

export function withReducer<T, M>(initialValue: T, reducer: (message: M, current: T) => T): ContainerInitializer<T, M> {
  return {
    initialValue,
    reducer
  }
}

export function container<T, M = T>(initializer: ContainerInitializer<T, M>): Container<T, M> {
  return new Container(initializer.initialValue, initializer.reducer)
}

export function write<T, M = T>(container: Container<T, M>, value: M): WriteMessage<T, M> {
  return {
    type: "write",
    token: container,
    value
  }
} 
