import { Container, WriteValueMessage } from "./state"

export interface LoadingState<K> {
  type: "loading"
  key?: K
}

export interface LoadedState<T, K> {
  type: "loaded"
  value: T
  key?: K
}

export interface WritingState<T> {
  type: "writing",
  value: T
}

// I'd prefer to have WritingState here only if the state is actually writable ...
export type Managed<T, K> = LoadingState<K> | LoadedState<T, K> | WritingState<T>


export function managedWriter<T, K>(container: Container<Managed<T, K>>): (value: T) => WriteValueMessage<Managed<T, K>> {
  return (value) => ({
    type: "write",
    value: {
      type: "writing",
      value
    },
    state: container
  })
}
