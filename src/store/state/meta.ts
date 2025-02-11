import { StateWriter } from "./publisher/stateWriter.js"
import { createPublisher, State, StateListener, StatePublisher, TokenRegistry } from "../tokenRegistry.js"

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

export function ok(): OkMessage {
  return {
    type: "ok"
  }
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

  [createPublisher](registry: TokenRegistry): StatePublisher<Meta<M, E>> {
    const publisher = registry.get<StatePublisher<any>>(this.token)

    const writer = new StateWriter<Meta<M, E>>(ok())

    publisher.addListener(new MetaStateListener(registry, writer))

    return writer
  }
}

class MetaStateListener<M, E> implements StateListener {
  overrideVersionTracking = true

  constructor(public registry: TokenRegistry, private writer: StateWriter<Meta<M, E>>) { }

  init(): void {
    this.run()
  }

  run(): void {
    this.writer.write(ok())
  }
}