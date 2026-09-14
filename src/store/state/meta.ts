import { createStateHandler, GetState, StateListenerType, StatePublisher, TokenRegistry, getStateHandler, PublishableState, StateToken, StateDerivation, State, initListener } from "../tokenRegistry.js"
import { Container } from "./container.js"
import { Publisher } from "./handler/publisher.js"
import { SuppliedState } from "./supplied.js"

export interface PendingMessage<M> {
  type: "pending"
  message: M
}

export interface OkMessage {
  type: "ok"
}

export interface ErrorMessage<M, E> {
  type: "error"
  message: M
  reason: E
}

export type Meta<M, E> = OkMessage | PendingMessage<M> | ErrorMessage<M, E>

const okMessage: OkMessage = { type: "ok" }

export function ok(): OkMessage {
  return okMessage
}

export function pending(): PendingMessage<undefined>
export function pending<M>(message: M): PendingMessage<M>
export function pending<M>(message?: M): PendingMessage<M | undefined> {
  return {
    type: "pending",
    message
  }
}

export function error<E>(reason: E): ErrorMessage<undefined, E>
export function error<M, E>(reason: E, message: M): ErrorMessage<M, E>
export function error<M, E>(reason: E, message?: M): ErrorMessage<M | undefined, E> {
  return {
    type: "error",
    message,
    reason
  }
}

const metaTokenRegistry = new WeakMap<State<any>, MetaState<any, any, any>>()

export function meta<T, M, E>(state: Container<T, M, E>): MetaState<T, M, E>
export function meta<T, E>(state: SuppliedState<T, E>): MetaState<T, undefined, E>
export function meta<T, M, E>(state: Container<T, M, E> | SuppliedState<T, E>): MetaState<T, M, E>
export function meta<T, M, E>(state: Container<T, M, E> | SuppliedState<T, E>): MetaState<T, M, E> {
  let metaToken = metaTokenRegistry.get(state)
  if (metaToken === undefined) {
    metaToken = new MetaState(state)
    metaTokenRegistry.set(state, metaToken)
  }
  return metaToken
}

export class MetaState<T, M, E = unknown> implements PublishableState<Meta<M, E>> {
  readonly name: string

  constructor(private token: StateToken<T>) {
    this.name = `meta[${token}]`
  }

  [getStateHandler](registry: TokenRegistry): StatePublisher<Meta<M, E>> {
    return registry.getState(this)
  }

  [createStateHandler](registry: TokenRegistry, serializedState?: Meta<M, E>): StatePublisher<Meta<M, E>> {
    const reader = new MetaStateReader<M, E>(this.token, serializedState ?? ok())
    initListener(registry, reader)
    return reader
  }

  toString() {
    return this.name
  }
}

class MetaStateReader<M, E> extends Publisher<Meta<M, E>> implements StateDerivation {
  readonly type = StateListenerType.Derivation

  constructor(private token: StateToken<any>, initialValue: Meta<M, E>) {
    super(initialValue)
  }

  init(get: GetState): void {
    // Subscribe to state updates on the token
    get(this.token)
  }

  // This effect fires when the token updates with a new value, and so
  // at that point we set the Meta token state to Ok. Hooks can still
  // write a different value (pending/error) to Meta state directly.
  run(get: GetState): void {
    // Resubscribe to state updates on this token
    get(this.token)

    if (this.value === ok()) {
      this.notifyStable()
      return
    }

    this.value = ok()

    this.runSubscribers()
  }
}
