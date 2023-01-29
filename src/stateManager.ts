export interface LoadingState {
  type: "loading"
}

export interface LoadedState<T> {
  type: "loaded"
  value: T
}

export type Managed<T> = LoadingState | LoadedState<T>

export interface StateManager<T> {
  onChange(callback: (value: Managed<T>) => void): void
}

export interface ManagedValue<T> {
  type: "managed-value"
  initialState: Managed<T>
}

export function managedValue<T>(): ManagedValue<T> {
  return {
    type: "managed-value",
    initialState: {
      type: "loading"
    }
  }
}
