import { createStateHandler, getStateHandler, PublishableState, State, StatePublisher, TokenRegistry } from "../tokenRegistry.js"
import { MetaState, WithMetaState } from "./meta.js"
import { Publisher } from "./handler/publisher.js"

export interface SuppliedStateInitializer<T> {
  name?: string
  initialValue: T
}

export function supplied<T, E = any>(initializer: SuppliedStateInitializer<T>): SuppliedState<T, E> {
  return new SuppliedState(initializer.name, initializer.initialValue)
}

export class SuppliedState<T, E = any> extends State<T> implements PublishableState<T>, WithMetaState<T, never, E> {
  private _meta: MetaState<T, never, E> | undefined

  constructor(name: string | undefined, private initialValue: T) {
    super(name)
  }

  [createStateHandler](): StatePublisher<T> {
    return new Publisher(this.initialValue)
  }

  [getStateHandler](registry: TokenRegistry): StatePublisher<T> {
    return registry.getState(this)
  }

  get meta(): MetaState<T, never, E> {
    if (this._meta === undefined) {
      this._meta = new MetaState(this)
    }
    return this._meta
  }
}