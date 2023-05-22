import { Container, Selection, SelectionActions, StoreMessage } from "./store.js";

export function selection<T, M, Q = undefined>(container: Container<T, M>, definition: (actions: SelectionActions<T>, inputValue: Q) => M): Selection<T, M, Q> {
  return {
    container,
    query: definition
  }
}

export function write<T, M = T>(container: Container<T, M>, value: M): StoreMessage<T, M> {
  return store(selection(container, (_, val: M) => val), value)
}

export function store<T, M, Q>(selection: Selection<T, M, Q>, input?: Q): StoreMessage<T, M> {
  return {
    type: "store",
    selection,
    input
  }
}
