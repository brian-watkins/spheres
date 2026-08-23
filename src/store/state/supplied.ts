import { createStateHandler, getStateHandler, PublishableState, StatePublisher, TokenRegistry } from "../tokenRegistry.js"
import { Publisher } from "./handler/publisher.js"
import { Reconciler } from "./reconciler.js"
import { didCreateToken } from "./stateRecorder.js"

export interface SuppliedStateInitializer<T> {
  name?: string
  initialValue: T
  reconciler?: Reconciler<T>
}

export function supplied<T, E = any>(initializer: SuppliedStateInitializer<T>): SuppliedState<T, E> {
  const token = new SuppliedState(initializer.name, initializer.initialValue, initializer.reconciler)
  didCreateToken(token)
  return token
}

declare const errorType: unique symbol

export class SuppliedState<T, E = any> implements PublishableState<T> {
  declare readonly [errorType]?: E

  constructor(
    readonly name: string | undefined,
    private initialValue: T,
    private reconciler: Reconciler<T> | undefined
  ) { }

  [createStateHandler](): StatePublisher<T> {
    return new Publisher(this.initialValue, this.reconciler)
  }

  [getStateHandler](registry: TokenRegistry): StatePublisher<T> {
    return registry.getState(this)
  }

  toString() {
    return this.name ?? "SuppliedState"
  }
}