import { createPublisher, State, StatePublisher, TokenRegistry } from "../tokenRegistry.js";

export interface ConstantInitializer<T> {
  initialValue: T
}

export function constant<T>(initializer: ConstantInitializer<T>): Constant<T> {
  return new Constant(initializer.initialValue)
}

export class Constant<T> extends State<T> {
  constructor(private initialValue: T) {
    super(undefined, undefined)
  }

  [createPublisher](_: TokenRegistry, initialState?: T | undefined): StatePublisher<T> {
    return new ConstantStateController(initialState ?? this.initialValue)
  }
}

export class ConstantStateController<T> implements StatePublisher<T> {
  constructor(private value: T) { }

  addListener(): void { }

  removeListener(): void { }

  setValue(value: T) {
    this.value = value
  }

  getValue(): T {
    return this.value
  }
}
