import { StateWriter } from "./state/publisher/stateWriter.js"
import { Command, getPublisher, GetState, runQuery, State, StateReference, TokenRegistry } from "./tokenRegistry.js"

export const initialValue = Symbol("initialValue")

export interface ResettableState<T> extends State<T> {
  [initialValue]: T
}

export interface UpdateResult<T> {
  value: T
  message?: StoreMessage
}

export interface WritableState<T, M = T> extends StateReference<T> {
  [getPublisher](registry: TokenRegistry): StateWriter<T, M>
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

export function dispatchMessage(registry: TokenRegistry, message: StoreMessage<any>) {
  switch (message.type) {
    case "write": {
      message.token[getPublisher](registry).write(message.value)
      break
    }
    case "update": {
      const writer = message.token[getPublisher](registry)
      writer.write(message.generator(writer.getValue()))
      break
    }
    case "exec": {
      registry.getCommand(message.command).run(message.message)
      break
    }
    case "reset": {
      const writer = registry.getState<StateWriter<unknown>>(message.container)
      writer.publish(message.container[initialValue])
      break
    }
    case "use": {
      const statefulMessage = runQuery(registry, message.rule) ?? { type: "batch", messages: [] }
      dispatchMessage(registry, statefulMessage)
      break
    }
    case "run": {
      message.effect()
      break
    }
    case "batch": {
      for (let i = 0; i < message.messages.length; i++) {
        dispatchMessage(registry, message.messages[i])
      }
      break
    }
  }
}
