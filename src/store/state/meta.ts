import { StateWriter } from "./publisher/stateWriter.js"
import { createPublisher, GetState, State, StateListener, StateListenerType, StatePublisher, TokenRegistry } from "../tokenRegistry.js"

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

  [createPublisher](registry: TokenRegistry, serializedState?: Meta<M, E>): StatePublisher<Meta<M, E>> {
    const publisher = registry.getState(this.token)

    const writer = new StateWriter<Meta<M, E>>(serializedState ?? ok())

    publisher.addListener(new MetaStateListener(registry, this.token, writer))

    return writer
  }
}

class MetaStateListener<M, E> implements StateListener {
  readonly type = StateListenerType.StateEffect

  constructor(public registry: TokenRegistry, private token: State<any>, private writer: StateWriter<Meta<M, E>>) { }

  init(get: GetState): void {
    this.run(get)
  }

  run(get: GetState): void {
    // to resubscribe to state updates on this token
    get(this.token)

    this.writer.write(ok())
  }
}