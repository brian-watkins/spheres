import { MetaState, WithMetaState } from "./meta.js"
import { didCreateToken } from "./stateRecorder.js"
import { createStateHandler, getStateHandler, isStateful, runQuery, Stateful, StatePublisher, StateWriter, TokenRegistry, WritableState } from "../tokenRegistry.js"
import { getInitialValue, ResettableState } from "../message.js"
import { MessageWriter, UpdateResult } from "./handler/messageWriter.js"
import { Writer } from "./handler/writer.js"

export interface ContainerInitializer<T, M> {
  initialValue: T | Stateful<T>,
  update?: (message: M, current: T) => UpdateResult<T>
  name?: string
}

export function container<T, M = T, E = any>(initializer: ContainerInitializer<T, M>): Container<T, M, E> {
  const token = new Container<T, M, E>(
    initializer.name,
    initializer.initialValue,
    initializer.update,
  )
  didCreateToken(token)
  return token
}

export const clone = Symbol("clone-container")

export class Container<T, M = T, E = any> implements ResettableState<T>, WritableState<T, M>, WithMetaState<T, M, E> {
  private _meta: MetaState<T, M, E> | undefined

  constructor(
    readonly name: string | undefined,
    private initialValue: T | Stateful<T>,
    private update: ((message: M, current: T) => UpdateResult<T>) | undefined,
  ) { }

  [getInitialValue](registry: TokenRegistry): T {
    return isStateful(this.initialValue) ?
      runQuery(registry, this.initialValue) :
      this.initialValue
  }

  [getStateHandler](registry: TokenRegistry): StateWriter<T, M> {
    return registry.getState(this)
  }

  [createStateHandler](registry: TokenRegistry): StatePublisher<T> {
    const value = this[getInitialValue](registry)

    return this.update ?
      new MessageWriter(registry, value, this.update) :
      new Writer(value)
  }

  [clone](): Container<T, M, E> {
    return new Container(this.name, this.initialValue, this.update)
  }

  get meta(): MetaState<T, M, E> {
    if (this._meta === undefined) {
      this._meta = new MetaState(this)
    }
    return this._meta
  }

  toString() {
    return this.name ?? "Container"
  }
}