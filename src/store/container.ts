import { didCreateToken } from "./stateRecorder.js"
import { Container, UpdateResult } from "./store.js"

export interface ContainerInitializer<T, M> {
  id?: string,
  initialValue: T,
  update?: (message: M, current: T) => UpdateResult<T>
  name?: string
}

export function container<T, M = T, E = any>(initializer: ContainerInitializer<T, M>): Container<T, M, E> {
  const token = new Container(
    initializer.id,
    initializer.name,
    initializer.initialValue,
    initializer.update
  )
  didCreateToken(token)
  return token
}
