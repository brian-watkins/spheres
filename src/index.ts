import { Container, Loop, Meta, Provider, Rule, State, TriggerRuleMessage, Writer, WriteValueMessage } from "./loop.js"
export { Loop, ok, pending, error } from "./loop.js"
export type { Container, State, Provider, Writer, PendingMessage, OkMessage, Meta } from "./loop.js"

export interface ContainerInitializer<T, M = T> {
  initialize(loop: Loop): Container<T, M>
}

export function withInitialValue<T>(value: T): ContainerInitializer<T> {
  return {
    initialize: (loop) => {
      return loop.createContainer(value, (val) => val)
    }
  }
}

export function withReducer<T, M>(initialValue: T, update: (message: M, current: T) => T): ContainerInitializer<T, M> {
  return {
    initialize: (loop) => {
      return loop.createContainer(initialValue, update)
    }
  }
}

let mainLoop: Loop = new Loop()

export function loop(): Loop {
  return mainLoop
}

export function container<T, M = T>(initializer: ContainerInitializer<T, M>): Container<T, M> {
  return initializer.initialize(loop())
}

export function meta<T, M = T>(state: Container<T, M> | State<M>): State<Meta<M>> {
  return loop().fetchMetaContainer(state)
}

export type GetState = <S>(state: State<S>) => S

export function state<T>(derivation: (get: GetState) => T): State<T> {
  return loop().deriveContainer(derivation).state
}

export function rule<M, Q = undefined>(container: Container<any, M>, definition: (get: <S>(state: State<S>) => S, inputValue: Q) => M): Rule<M, Q> {
  return {
    container,
    apply: definition
  }
}

export function useProvider(provider: Provider) {
  loop().registerProvider(provider)
}

export function useWriter<T, M = T>(container: Container<T, M>, writer: Writer<M>) {
  loop().registerWriter(container, writer)
}

export function writeMessage<T, M>(container: Container<T, M>, value: M): WriteValueMessage<T, M> {
  return {
    type: "write",
    value,
    container
  }
}

type TriggerInputArg<Q> = Q extends undefined ? [] : [Q]

export function trigger<M, Q>(rule: Rule<M, Q>, ...input: TriggerInputArg<Q>): TriggerRuleMessage<M> {
  return {
    type: "trigger",
    rule,
    input: input.length === 0 ? undefined : input[0]
  }
}
