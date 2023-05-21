import { Container, Command, CommandActions, StoreMessage } from "./store.js";

export function command<T, M, Q = undefined>(container: Container<T, M>, definition: (actions: CommandActions<T>, inputValue: Q) => M): Command<T, M, Q> {
  return {
    container,
    execute: definition
  }
}

export function write<T, M = T>(container: Container<T, M>, value: M): StoreMessage<T, M> {
  return dispatch(command(container, (_, val: M) => val), value)
}

export function dispatch<T, M, Q>(command: Command<T, M, Q>, input?: Q): StoreMessage<T, M> {
  return {
    type: "dispatch",
    command,
    input
  }
}
