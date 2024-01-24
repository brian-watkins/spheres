import { Command, ExecMessage, GetState } from "./store";

export interface CommandInitializer<M> {
  trigger?: (get: GetState) => M
}

export function command<M>(initializer: CommandInitializer<M> = {}): Command<M> {
  return new Command<M>(initializer.trigger)
}

export function exec<M>(command: Command<M>, message: M): ExecMessage<M> {
  return {
    type: "exec",
    command,
    message
  }
}