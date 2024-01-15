import { Command, ExecMessage, GetState, SuppliedState } from "./store";

export interface CommandInitializer<M> {
  query?: (get: GetState) => M
}

export function command<M>(initializer: CommandInitializer<M> = {}): Command<M> {
  return new Command<M>(initializer.query)
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