import { ReactiveVariable, State, Variable } from "./store.js";

export interface VariableInitializer<T> {
  initialValue: T
}

export function variable<T>(initializer: VariableInitializer<T>): Variable<T> {
  return new Variable(initializer.initialValue)
}

export function reactiveVariable<T>(initializer: VariableInitializer<State<T>>): ReactiveVariable<T> {
  return new ReactiveVariable(initializer.initialValue)
}