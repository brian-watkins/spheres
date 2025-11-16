import { MetaState, WithMetaState } from "./meta.js"
import { didCreateToken } from "./stateRecorder.js"
import { createStateHandler, getStateHandler, State, StatePublisher, StateWriter, TokenRegistry, WritableState } from "../tokenRegistry.js"
import { initialValue, ResettableState } from "../message.js"
import { MessageWriter, UpdateResult } from "./handler/messageWriter.js"
import { Writer } from "./handler/writer.js"

export interface ContainerInitializer<T, M> {
  initialValue: T,
  update?: (message: M, current: T) => UpdateResult<T>
  name?: string
}

export function container<T, M = T, E = any>(initializer: ContainerInitializer<T, M>): Container<T, M, E> {
  const token = new Container<T, M, E>(
    initializer.name,
    initializer.initialValue,
    initializer.update
  )
  didCreateToken(token)
  return token
}

export class Container<T, M = T, E = any> extends State<T> implements ResettableState<T>, WritableState<T, M>, WithMetaState<T, M, E> {
  private _meta: MetaState<T, M, E> | undefined

  constructor(
    name: string | undefined,
    private initialValue: T,
    private update: ((message: M, current: T) => UpdateResult<T>) | undefined,
  ) {
    super(name)
  }

  get [initialValue](): T {
    return this.initialValue
  }

  [getStateHandler](registry: TokenRegistry): StateWriter<T, M> {
    return registry.getState(this)
  }

  [createStateHandler](registry: TokenRegistry, serializedState?: T): StatePublisher<T> {
    return this.update ?
      new MessageWriter(registry, serializedState ?? this.initialValue, this.update) :
      new Writer(serializedState ?? this.initialValue)
  }

  get meta(): MetaState<T, M, E> {
    if (this._meta === undefined) {
      this._meta = new MetaState(this)
    }
    return this._meta
  }
}
