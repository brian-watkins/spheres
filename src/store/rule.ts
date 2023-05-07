import { Container, GetState, Rule, TriggerMessage } from "./store.js";

export function rule<M, Q = undefined>(container: Container<any, M>, definition: (get: GetState, inputValue: Q) => M): Rule<M, Q> {
  return {
    container,
    apply: definition
  }
}

export type TriggerInputArg<Q> = Q extends undefined ? [] : [Q]

export function trigger<M, Q>(rule: Rule<M, Q>, ...input: TriggerInputArg<Q>): TriggerMessage<M> {
  return {
    type: "trigger",
    rule,
    input: input.length === 0 ? undefined : input[0]
  }
}
