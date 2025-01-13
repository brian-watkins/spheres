import { MetaState } from "./meta.js"
import { StateWriter } from "./publisher/stateWriter.js"
import { createPublisher, State, TokenRegistry } from "../tokenRegistry.js"

export interface SuppliedStateInitializer<T> {
  name?: string
  initialValue: T
}

export function supplied<T, M = any, E = any>(initializer: SuppliedStateInitializer<T>): SuppliedState<T, M, E> {
  return new SuppliedState(initializer.name, initializer.initialValue)
}

export class SuppliedState<T, M = any, E = any> extends State<T> {
  private _meta: MetaState<T, M, E> | undefined

  constructor(name: string | undefined, private initialValue: T) {
    super(name)
  }

  [createPublisher](_: TokenRegistry, serializedState?: T): StateWriter<T> {
    return new StateWriter(serializedState ?? this.initialValue)
  }

  get meta(): MetaState<T, M, E> {
    if (this._meta === undefined) {
      this._meta = new MetaState(this)
    }
    return this._meta
  }
}
