import { Container, Selection, SelectionActions, StoreMessage } from "./store.js";

export function selection<T, M, Q = unknown>(container: Container<T, M>, definition: (actions: SelectionActions<T>, inputValue: Q) => M): Selection<T, M, Q> {
  return {
    container,
    query: definition
  }
}

export function write<T, M = T>(container: Container<T, M>, value: M): StoreMessage<T, M> {
  return store<T, M, any>(selection(container, (_, val: M) => val), value)
}

export type StoreArg<Q> = Q extends undefined ? [] : [Q]

export function store<T, M, Q>(selection: Selection<T, M, Q>, ...input: StoreArg<Q>): StoreMessage<T, M> {
  return {
    type: "store",
    selection,
    input: input.length === 0 ? undefined : input[0]
  }
}
