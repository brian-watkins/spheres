import { MetaState } from "./meta.js"
import { didCreateToken } from "./stateRecorder.js"
import { createPublisher, State, TokenRegistry } from "../tokenRegistry.js"
import { StateWriter } from "./publisher/stateWriter.js"
import { dispatchMessage, initialValue, ResetMessage, StoreMessage, UpdateMessage, WritableState, WriteMessage } from "../message.js"

export interface UpdateResult<T> {
  value: T
  message?: StoreMessage<any>
}

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

export function write<T, M = T>(container: Container<T, M>, value: NoInfer<M>): WriteMessage<T, M> {
  return {
    type: "write",
    container,
    value
  }
}

export function update<T, M = T>(container: Container<T, M>, generator: (current: NoInfer<T>) => NoInfer<M>): UpdateMessage<T, M> {
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
    name: string | undefined,
    private initialValue: T,
    private update: ((message: M, current: T) => UpdateResult<T>) | undefined,
  ) {
    super(name)
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

export class MessageDispatchingStateWriter<T, M> extends StateWriter<T> {
  constructor(private registry: TokenRegistry, initialValue: T, private update: ((message: M, current: T) => UpdateResult<T>)) {
    super(initialValue)
  }

  accept(message: M): void {
    const result = this.update(message, this.getValue())
    this.publish(result.value)
    if (result.message !== undefined) {
      dispatchMessage(this.registry, result.message)
    }
  }
}