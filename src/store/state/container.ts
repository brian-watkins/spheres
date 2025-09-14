import { MetaState } from "./meta.js"
import { didCreateToken } from "./stateRecorder.js"
import { createPublisher, TokenRegistry } from "../tokenRegistry.js"
import { StateWriter } from "./publisher/stateWriter.js"
import { initialValue, ResetMessage, ResettableState, WritableState } from "../message.js"
import { MessageDispatchingStateWriter, UpdateResult } from "./publisher/messageDispatchingStateWriter.js"

export interface ContainerInitializer<T, M> {
  initialValue: T,
  update?: (message: M, current: T) => UpdateResult<T>
  name?: string
}

export function container<T, M = T, E = any>(initializer: ContainerInitializer<T, M>): Container<T, M, E> {
  const token = new Container(
    initializer.name,
    initializer.initialValue,
    initializer.update
  )
  didCreateToken(token)
  return token
}

export function reset<T, M = T>(container: Container<T, M>): ResetMessage<T> {
  return {
    type: "reset",
    container
  }
}

export class Container<T, M = T, E = any> extends WritableState<T, M> implements ResettableState<T> {
  private _meta: MetaState<T, M, E> | undefined

  constructor(
    name: string | undefined,
    private initialValue: T,
    update: ((message: M, current: T) => UpdateResult<T>) | undefined,
  ) {
    super(name, update)
  }

  get [initialValue](): T {
    return this.initialValue
  }

  [createPublisher](registry: TokenRegistry, serializedState?: T): StateWriter<T> {
    return this.update ?
      new MessageDispatchingStateWriter(registry, serializedState ?? this.initialValue, this.update) :
      new StateWriter(serializedState ?? this.initialValue)
  }

  get meta(): MetaState<T, M, E> {
    if (this._meta === undefined) {
      this._meta = new MetaState(this)
    }
    return this._meta
  }
}
