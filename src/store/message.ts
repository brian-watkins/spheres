import { BatchMessage, Container, RunMessage, UseMessage, StoreMessage, WriteMessage, Rule, ResetMessage, UpdateMessage } from "./store"

export function write<T, M = T>(container: Container<T, M>, value: M): WriteMessage<T, M> {
  return {
    type: "write",
    container,
    value
  }
}

export function update<T, M = T>(container: Container<T, M>, generator: (current: T) => M): UpdateMessage<T, M> {
  return {
    type: "update",
    container,
    generator
  }
}

export function reset<T, M = T>(container: Container<T, M>): ResetMessage<T, M> {
  return {
    type: "reset",
    container
  }
}

export function run(effect: () => void): RunMessage {
  return {
    type: "run",
    effect
  }
}

export function batch(messages: Array<StoreMessage<any>>): BatchMessage {
  return {
    type: "batch",
    messages
  }
}

export type RuleArg<Q> = Q extends undefined ? [] : [Q]

export function use<Q = undefined>(rule: Rule<Q>, ...input: RuleArg<Q>): UseMessage {
  return {
    type: "use",
    rule,
    input: input.length === 0 ? undefined : input[0]
  }
}
