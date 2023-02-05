import { Container, Loop, State, WriteValueMessage } from "./state"

export interface LoadingState<K> {
  type: "loading"
  key?: K
}

export interface LoadedState<T, K> {
  type: "loaded"
  value: T
  key?: K
}

export interface WritingState<T, K> {
  type: "writing",
  value: T
  key?: K
}

// I'd prefer to have WritingState here only if the state is actually writable ...
export type Managed<T, K> = LoadingState<K> | LoadedState<T, K> | WritingState<T, K>

export function manage<T, K>(loop: Loop, keyDerivation?: (get: <S>(atom: State<S>) => S) => K): State<Managed<T, K>> {
  return loop.deriveContainer((get) => {
    return {
      type: "loading",
      key: keyDerivation?.(get)
    }
  })
}

export function manageContainer<T>(loop: Loop): Container<Managed<T, void>> {
  return loop.createContainer<Managed<T, void>>({ type: "loading" })
}

export function managedWriter<T, K>(container: Container<Managed<T, K>>): (value: T) => WriteValueMessage<Managed<T, K>> {
  return (value) => ({
    type: "write",
    value: {
      type: "writing",
      value
    },
    container
  })
}
