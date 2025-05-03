import { StateWriter } from "./state/publisher/stateWriter.js"
import { Command, GetState, State, TokenRegistry } from "./tokenRegistry.js"

export const initialValue = Symbol("initialValue")

export interface WritableState<T> extends State<T> {
  [initialValue]: T
}

export interface WriteMessage<T, M = T> {
  type: "write"
  container: WritableState<T>
  value: M
}

export interface UpdateMessage<T, M = T> {
  type: "update"
  container: WritableState<T>
  generator: (current: T) => M
}

export interface ExecMessage<M> {
  type: "exec"
  command: Command<M>
  message: M
}

export interface ResetMessage<T> {
  type: "reset"
  container: WritableState<T>
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

export type StoreMessage<T, M = T> = WriteMessage<T, M> | UpdateMessage<T, M> | ResetMessage<T> | UseMessage | BatchMessage | RunMessage | ExecMessage<M>

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

export function dispatchMessage(registry: TokenRegistry, message: StoreMessage<any>) {
  switch (message.type) {
    case "write": {
      registry.getState<StateWriter<any>>(message.container).write(message.value)
      break
    }
    case "update": {
      const writer = registry.getState<StateWriter<any>>(message.container)
      writer.write(message.generator(writer.getValue()))
      break
    }
    case "exec": {
      registry.getCommand(message.command).run(message.message)
      break
    }
    case "reset": {
      const writer = registry.getState<StateWriter<any>>(message.container)
      writer.write(message.container[initialValue])
      break
    }
    case "use": {
      const get: GetState = (state) => registry.getState(state).getValue()
      const statefulMessage = message.rule(get) ?? { type: "batch", messages: [] }
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
