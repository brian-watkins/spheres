import { Constant } from "./store";

export interface ConstantInitializer<T> {
  initialValue: T
}

export function constant<T>(initializer: ConstantInitializer<T>): Constant<T> {
  return new Constant(initializer.initialValue)
}