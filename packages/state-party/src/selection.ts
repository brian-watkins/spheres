import { BatchMessage, Container, Selection, SelectionActions, StoreMessage } from "./store.js";

export function selection<T, M, Q = never>(container: Container<T, M>, definition: (actions: SelectionActions<T>, inputValue: Q) => M): Selection<T, M, Q> {
  return {
    container,
    query: definition
  }
}

export function write<T, M = T>(container: Container<T, M>, value: M): StoreMessage<T, M> {
  return store<T, M, any>(selection(container, (_, val: M) => val), value)
}

export function batch(messages: Array<StoreMessage<any>>): BatchMessage {
  return {
    type: "batch",
    messages
  }
}

export type StoreArg<Q> = Q extends never ? [] : [Q]

export function store<T, M, Q>(selection: Selection<T, M, Q>, ...input: StoreArg<Q>): StoreMessage<T, M> {
  return {
    type: "select",
    selection,
    input: input.length === 0 ? undefined : input[0]
  }
}
