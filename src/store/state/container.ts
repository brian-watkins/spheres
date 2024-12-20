import { MetaState } from "./meta.js"
import { didCreateToken } from "./stateRecorder.js"
import { createPublisher, State, TokenRegistry } from "../tokenRegistry.js"
import { MessageDispatchingStateWriter, UpdateResult } from "./publisher/messageDispatchingStateWriter.js"
import { StateWriter } from "./publisher/stateWriter.js"
import { initialValue, ResetMessage, UpdateMessage, WritableState, WriteMessage } from "../message.js"

export interface ContainerInitializer<T, M> {
  id?: string,
  initialValue: T,
  update?: (message: M, current: T) => UpdateResult<T>
  name?: string
}

export function container<T, M = T, E = any>(initializer: ContainerInitializer<T, M>): Container<T, M, E> {
  const token = new Container(
    initializer.id,
    initializer.name,
    initializer.initialValue,
    initializer.update
  )
  didCreateToken(token)
  return token
}

export function write<T, M = T>(container: Container<T, M>, value: M): WriteMessage<T, M> {
  return {
    type: "write",
    container,
    value
  }
}

export function update<T, M = T>(container: Container<T, M>, generator: (current: T) => M): UpdateMessage<T, M> {
  return {
    type: "update",
    container,
    generator
  }
}

export function reset<T, M = T>(container: Container<T, M>): ResetMessage<T> {
  return {
    type: "reset",
    container
  }
}

export class Container<T, M = T, E = any> extends State<T> implements WritableState<T> {
  private _meta: MetaState<T, M, E> | undefined

  constructor(
    id: string | undefined,
    name: string | undefined,
    private initialValue: T,
    private update: ((message: M, current: T) => UpdateResult<T>) | undefined,
  ) {
    super(id, name)
  }

  get [initialValue](): T {
    return this.initialValue
  }

  [createPublisher](registry: TokenRegistry, serializedState?: T): StateWriter<T> {
    return this.update ?
      new MessageDispatchingStateWriter(registry, serializedState ?? this.initialValue, this.update) :
      new StateWriter(registry, serializedState ?? this.initialValue)
  }

  get meta(): MetaState<T, M, E> {
    if (this._meta === undefined) {
      this._meta = new MetaState(this)
    }
    return this._meta
  }
}
