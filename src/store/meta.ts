export interface PendingMessage<M> {
  type: "pending"
  message: M
}

export interface OkMessage {
  type: "ok"
}

export interface ErrorMessage<M> {
  type: "error"
  message: M
}

export type Meta<M> =  OkMessage | PendingMessage<M> | ErrorMessage<M>

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

export function error<M>(message: M): ErrorMessage<M> {
  return {
    type: "error",
    message
  }
}
