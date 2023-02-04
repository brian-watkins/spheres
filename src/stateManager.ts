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
