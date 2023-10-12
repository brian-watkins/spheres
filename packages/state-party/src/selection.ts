import { BatchMessage, Container, GetState, RunMessage, SelectMessage, Selection, StoreMessage, WriteMessage } from "./store.js";

export function selection<Q = undefined>(definition: (get: GetState, inputValue: Q) => StoreMessage<any>): Selection<Q> {
  return {
    query: definition
  }
}

export function write<T, M = T>(container: Container<T, M>, value: M): WriteMessage<T, M> {
  return {
    type: "write",
    container,
    value
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

export type StoreArg<Q> = Q extends undefined ? [] : [Q]

export function store<Q = undefined>(selection: Selection<Q>, ...input: StoreArg<Q>): SelectMessage {
  return {
    type: "select",
    selection,
    input: input.length === 0 ? undefined : input[0]
  }
}
