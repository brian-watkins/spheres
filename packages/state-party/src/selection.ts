import { BatchMessage, Container, GetState, SelectMessage, Selection, StoreMessage, WriteMessage } from "./store.js";

export function selection<Q = never>(definition: (get: GetState, inputValue: Q) => StoreMessage<any>): Selection<Q> {
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

export function batch(messages: Array<StoreMessage<any>>): BatchMessage {
  return {
    type: "batch",
    messages
  }
}

export type StoreArg<Q> = Q extends never ? [] : [Q]

export function store<Q = never>(selection: Selection<Q>, ...input: StoreArg<Q>): SelectMessage {
  return {
    type: "select",
    selection,
    input: input.length === 0 ? undefined : input[0]
  }
}
