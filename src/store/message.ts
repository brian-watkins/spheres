import { BatchPublisher } from "./state/handler/batchPublisher.js"
import { Command, getStateHandler, GetState, TokenRegistry, WritableState, StateBatch, PublishableState, runQuery } from "./tokenRegistry.js"

export const getInitialValue = Symbol("initialValue")

export interface ResettableState<T> extends PublishableState<T> {
  [getInitialValue](registry: TokenRegistry): T
}

export interface UpdateResult<T> {
  value: T
  message?: StoreMessage
}

export interface WriteMessage<T, M = T> {
  type: "write"
  token: WritableState<T, M>
  value: M
}

export interface UpdateMessage<T, M = T> {
  type: "update"
  token: WritableState<T, M>
  generator: (current: T) => M
}

export interface ExecMessage<M> {
  type: "exec"
  command: Command<M>
  message: M
}

export interface ResetMessage<T> {
  type: "reset"
  container: ResettableState<T>
}

export interface UseMessage {
  type: "use"
  rule: (get: GetState) => StoreMessage<any> | undefined
}

export interface RunMessage {
  type: "run"
  effect: () => void
}

export interface BatchMessage {
  type: "batch"
  messages: ReadonlyArray<StoreMessage<any>>
}

export type StoreMessage<T = any, M = T> = WriteMessage<T, M> | UpdateMessage<T, M> | ResetMessage<T> | UseMessage | BatchMessage | RunMessage | ExecMessage<M>

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

export function batch(messages: ReadonlyArray<StoreMessage<any>>): BatchMessage {
  return {
    type: "batch",
    messages
  }
}

export function write<T, M>(state: WritableState<T, M>, message: NoInfer<M>): WriteMessage<T, M> {
  return {
    type: "write",
    token: state,
    value: message
  }
}

export function update<T, M>(state: WritableState<T, M>, generator: (current: NoInfer<T>) => NoInfer<M>): UpdateMessage<T, M> {
  return {
    type: "update",
    token: state,
    generator
  }
}

export function reset<T>(container: ResettableState<T>): ResetMessage<T> {
  return {
    type: "reset",
    container
  }
}

// Note: Currently all stores would use this same stack
// We could have a map keyed by registry if we need to distinguish by store
const batchStack: Array<StateBatch> = []

export function joinBatch(handler: (batch: StateBatch | undefined) => void): void {
  handler(batchStack.at(-1))
}

export function dispatchMessage(registry: TokenRegistry, message: StoreMessage<any>, batch?: StateBatch) {
  switch (message.type) {
    case "write": {
      message.token[getStateHandler](registry).write(message.value, batch)
      break
    }
    case "update": {
      const writer = message.token[getStateHandler](registry)
      writer.write(message.generator(writer.getValue()), batch)
      break
    }
    case "reset": {
      const value = message.container[getInitialValue](registry)
      message.container[getStateHandler](registry).publish(value, batch)
      break
    }
    case "use": {
      const statefulMessage = runQuery(registry, message.rule, batch) ?? { type: "batch", messages: [] }
      dispatchMessage(registry, statefulMessage, batch)
      break
    }
    case "exec": {
      if (batch !== undefined) batch.publish()
      registry.getCommand(message.command).run(registry, message.message)
      break
    }
    case "run": {
      if (batch !== undefined) batch.publish()
      message.effect()
      break
    }
    case "batch": {
      if (batch !== undefined) {
        dispatchBatch(registry, batch, message.messages)
        break
      }
      const nextBatch = new BatchPublisher()
      batchStack.push(nextBatch)
      dispatchBatch(registry, nextBatch, message.messages)
      nextBatch.publish()
      nextBatch.close()
      batchStack.pop()
      break
    }
  }
}

function dispatchBatch(registry: TokenRegistry, batch: StateBatch, messages: ReadonlyArray<StoreMessage>): void {
  for (let i = 0; i < messages.length; i++) {
    dispatchMessage(registry, messages[i], batch)
  }
}
