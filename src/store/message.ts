import { BatchPublisher } from "./state/handler/batchPublisher.js"
import { Command, getStateHandler, GetState, runQuery, State, StatePublisher, TokenRegistry, WritableState, StateBatch } from "./tokenRegistry.js"

export const initialValue = Symbol("initialValue")

export interface ResettableState<T> extends State<T> {
  [initialValue]: T
  [getStateHandler](registry: TokenRegistry): StatePublisher<T>
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
  messages: Array<StoreMessage<any>>
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

export function batch(messages: Array<StoreMessage<any>>): BatchMessage {
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
      registry.getState(message.container).publish(message.container[initialValue], batch)
      break
    }
    case "use": {
      const statefulMessage = runQuery(registry, message.rule) ?? { type: "batch", messages: [] }
      dispatchMessage(registry, statefulMessage, batch)
      break
    }
    case "exec": {
      if (batch !== undefined) batch.publish()
      registry.getCommand(message.command).run(message.message)
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
      const batchPublisher = new BatchPublisher()
      dispatchBatch(registry, batchPublisher, message.messages)
      batchPublisher.publish()
      break
    }
  }
}

function dispatchBatch(registry: TokenRegistry, batch: StateBatch, messages: Array<StoreMessage>): void {
  for (let i = 0; i < messages.length; i++) {
    dispatchMessage(registry, messages[i], batch)
  }
}