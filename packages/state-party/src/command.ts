import { Container, Command, CommandActions, DispatchMessage } from "./store.js";

export function command<T, M, Q = undefined>(container: Container<T, M>, definition: (actions: CommandActions<T>, inputValue: Q) => M): Command<T, M, Q> {
  return {
    container,
    apply: definition
  }
}

export type DispatchArg<Q> = Q extends undefined ? [] : [Q]

export function dispatch<T, M, Q>(rule: Command<T, M, Q>, ...input: DispatchArg<Q>): DispatchMessage<T, M> {
  return {
    type: "dispatch",
    rule,
    input: input.length === 0 ? undefined : input[0]
  }
}
