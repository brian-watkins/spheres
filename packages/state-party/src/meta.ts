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
