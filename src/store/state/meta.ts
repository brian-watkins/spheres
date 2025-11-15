import { createStateHandler, GetState, State, StateListenerType, StatePublisher, createSubscriber, TokenRegistry, StateEffect, getStateHandler } from "../tokenRegistry.js"
import { SubscriberSetPublisher } from "./publisher/subscriberSetPublisher.js"

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

export function pending<M>(message: M): PendingMessage<M> {
  return {
    type: "pending",
    message
  }
}

export function error<M, E>(reason: E, message: M): ErrorMessage<M, E> {
  return {
    type: "error",
    message,
    reason
  }
}

export class MetaState<T, M, E = unknown> extends State<Meta<M, E>> {
  constructor(private token: State<T>) {
    super(`meta[${token}]`)
  }

  [getStateHandler](registry: TokenRegistry): StatePublisher<Meta<M, E>> {
    return registry.getState(this)
  }

  [createStateHandler](registry: TokenRegistry, serializedState?: Meta<M, E>): StatePublisher<Meta<M, E>> {
    const publisher = registry.getState(this.token)

    const writer = new SubscriberSetPublisher<Meta<M, E>>(serializedState ?? ok())

    publisher.addSubscriber(createSubscriber(registry, new MetaStateListener(this.token, writer)))

    return writer
  }
}

class MetaStateListener<M, E> implements StateEffect {
  readonly type = StateListenerType.SystemEffect

  constructor(private token: State<any>, private publisher: StatePublisher<Meta<M, E>>) { }

  init(get: GetState): void {
    this.run(get)
  }

  run(get: GetState): void {
    // to resubscribe to state updates on this token
    get(this.token)

    this.publisher.publish(ok())
  }
}