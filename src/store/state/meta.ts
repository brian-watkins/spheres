import { StateWriter } from "./publisher/stateWriter.js"
import { createPublisher, listenerVersion, State, StatePublisher, TokenRegistry } from "../tokenRegistry.js"

export interface PendingMessage<M> {
  type: "pending"
  message: M
}

export interface OkMessage {
  type: "ok"
}

export interface ErrorMessage<M, E> {
  type: "error"
  message: M | undefined
  reason: E
}

export type Meta<M, E> =  OkMessage | PendingMessage<M> | ErrorMessage<M, E>

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

export function error<M, E>(message: M | undefined, reason: E): ErrorMessage<M, E> {
  return {
    type: "error",
    message,
    reason
  }
}

export class MetaState<T, M, E = unknown> extends State<Meta<M, E>> {
  constructor(private token: State<T>) {
    super(token.id ? `meta[${token.id}]` : undefined, `meta[${token.toString()}]`)
  }

  [createPublisher](registry: TokenRegistry): StatePublisher<Meta<M, E>> {
    const publisher = registry.get<StatePublisher<any>>(this.token)

    const writer = new StateWriter<Meta<M, E>>(ok())

    publisher.addListener({
      get [listenerVersion]() { return 0 },
      set [listenerVersion](_: number) { },
      run: () => { writer.write(ok()) }
    })

    return writer
  }
}
