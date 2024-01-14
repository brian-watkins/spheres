import { Command, ExecMessage, SuppliedState } from "./store";

export function command<Message>(): Command<Message> {
  return new Command<Message>()
}

export function exec<M>(command: Command<M>, message: M): ExecMessage<M> {
  return {
    type: "exec",
    command,
    message
  }
}

export interface SuppliedStateInitializer<T> {
  initialValue: T
}

export function supplied<T, M, E>(initializer: SuppliedStateInitializer<T>): SuppliedState<T, M, E> {
  return new SuppliedState(initializer.initialValue)
}