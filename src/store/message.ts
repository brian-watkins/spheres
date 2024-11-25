import { BatchMessage, Container, RunMessage, StoreMessage, WriteMessage, ResetMessage, UpdateMessage, GetState, UseMessage } from "./store.js"

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

export function use(rule: (get: GetState) => StoreMessage<any> | undefined): UseMessage {
  return {
    type: "use",
    rule
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
