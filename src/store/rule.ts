import { Container, Rule, RuleActions, TriggerMessage } from "./store.js";

export function rule<T, M, Q = undefined>(container: Container<T, M>, definition: (actions: RuleActions<T>, inputValue: Q) => M): Rule<T, M, Q> {
  return {
    container,
    apply: definition
  }
}

export type TriggerInputArg<Q> = Q extends undefined ? [] : [Q]

export function trigger<T, M, Q>(rule: Rule<T, M, Q>, ...input: TriggerInputArg<Q>): TriggerMessage<T, M> {
  return {
    type: "trigger",
    rule,
    input: input.length === 0 ? undefined : input[0]
  }
}
