import { Container, Loop, Provider, Rule, State, TriggerRuleMessage, Writer, WriteValueMessage } from "./loop.js"
export { Loop } from "./loop.js"
export type { Container, State, Provider, Writer } from "./loop.js"

export interface ContainerInitializer<T, M = T> extends StateInitializer<T> {
  initialize(loop: Loop): Container<T, M>
}

export interface StateInitializer<T> {
  initialize(loop: Loop): State<T>
}

export function withInitialValue<T>(value: T): ContainerInitializer<T> {
  return {
    initialize: (loop) => {
      return loop.createContainer(value, (val) => val)
    }
  }
}

export function withDerivedValue<T>(derivation: (get: <S>(state: State<S>) => S) => T): StateInitializer<T> {
  return {
    initialize: (loop) => {
      return loop.deriveContainer(derivation)
    }
  }
}

let mainLoop: Loop = new Loop()

export function loop(): Loop {
  return mainLoop
}

export function container<T>(initializer: ContainerInitializer<T>): Container<T> {
  return initializer.initialize(loop())
}

export function state<T>(initializer: StateInitializer<T>): State<T> {
  return initializer.initialize(loop())
}

export function rule<T, Q = undefined, M = T>(container: Container<T, M>, definition: (get: <S>(state: State<S>) => S, inputValue: Q) => M): Rule<T, Q, M> {
  return {
    container,
    apply: definition
  }
}

export function useProvider(provider: Provider) {
  loop().registerProvider(provider)
}

export function useWriter<T>(container: Container<T>, writer: Writer<T>) {
  loop().registerWriter(container, writer)
}

export function writeMessage<T, M>(container: Container<T, M>, value: M): WriteValueMessage<T, M> {
  return {
    type: "write",
    value,
    state: container
  }
}

type TriggerInputArg<Q> = Q extends undefined ? [] : [Q]

export function trigger<T, Q, M>(rule: Rule<T, Q, M>, ...input: TriggerInputArg<Q>): TriggerRuleMessage<T, M> {
  return {
    type: "trigger",
    rule,
    input: input.length === 0 ? undefined : input[0]
  }
}
