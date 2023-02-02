export interface LoadingState<K> {
  type: "loading"
  key?: K
}

export interface LoadedState<T, K> {
  type: "loaded"
  value: T
  key?: K
}

export type Managed<T, K> = LoadingState<K> | LoadedState<T, K>

export interface StateManager<T, K = void> {
  refreshState(key: K): void
  onChange(callback: (value: Managed<T, K>) => void): void
}
