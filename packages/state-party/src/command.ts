import { Container, Command, CommandActions, StoreMessage } from "./store.js";

export function command<T, M, Q = undefined>(container: Container<T, M>, definition: (actions: CommandActions<T>, inputValue: Q) => M): Command<T, M, Q> {
  return {
    container,
    execute: definition
  }
}

export function write<T, M = T>(container: Container<T, M>, value: M): StoreMessage<T, M> {
  return {
    type: "dispatch",
    command: {
      container,
      execute: (_, value) => value
    },
    input: value
  }
}

export type DispatchArg<Q> = Q extends undefined ? [] : [Q]

export function dispatch<T, M, Q>(rule: Command<T, M, Q>, ...input: DispatchArg<Q>): StoreMessage<T, M> {
  return {
    type: "dispatch",
    command: rule,
    input: input.length === 0 ? undefined : input[0]
  }
}
