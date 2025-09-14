import { StateWriter } from "./state/publisher/stateWriter.js"
import { Command, GetState, IndexableState, IndexedStatePublisher, isIndexableStateReference, runQuery, State, StateReference, TokenRegistry } from "./tokenRegistry.js"

export const initialValue = Symbol("initialValue")

export interface ResettableState<T> extends State<T> {
  [initialValue]: T
}

export interface UpdateResult<T> {
  value: T
  message?: StoreMessage
}

export abstract class WritableState<Value, Message> extends State<Value> {
  constructor(name: string | undefined, protected update: ((message: Message, current: Value) => UpdateResult<Value>) | undefined) {
    super(name)
  }
}

export interface WriteMessage<T, M = T> {
  type: "write"
  container: WritableState<T, M>
  index?: any
  value: M
}

export interface UpdateMessage<T, M = T> {
  type: "update"
  container: WritableState<T, M>
  index?: any
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

export interface ClearMessage {
  type: "clear"
  collection: IndexableState<any, any>
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

export type StoreMessage<T = any, M = T> = WriteMessage<T, M> | UpdateMessage<T, M> | ResetMessage<T> | ClearMessage | UseMessage | BatchMessage | RunMessage | ExecMessage<M>

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

export function write<T, M, X extends WritableState<T, M>>(state: StateReference<X>, message: NoInfer<M>): WriteMessage<T, M> {
  if (isIndexableStateReference(state)) {
    return {
      type: "write",
      container: state[0],
      index: state[1],
      value: message
    }
  } else {
    return {
      type: "write",
      container: state,
      value: message
    }
  }
}

export function update<T, M, X extends WritableState<T, M>>(state: StateReference<X>, generator: (current: NoInfer<T>) => NoInfer<M>): UpdateMessage<T, M> {
  if (isIndexableStateReference(state)) {
    return {
      type: "update",
      container: state[0],
      index: state[1],
      generator
    }
  } else {
    return {
      type: "update",
      container: state,
      generator
    }
  }
}

export function dispatchMessage(registry: TokenRegistry, message: StoreMessage<any>) {
  switch (message.type) {
    case "write": {
      let publisher = registry.getState<StateWriter<any>>(message.container)
      if (publisher instanceof IndexedStatePublisher) {
        publisher = publisher.indexedBy<StateWriter<any>>(message.index)
      }
      publisher.write(message.value)
      break
    }
    case "update": {
      let writer = registry.getState<StateWriter<any>>(message.container)
      if (writer instanceof IndexedStatePublisher) {
        writer = writer.indexedBy<StateWriter<any>>(message.index)
      }
      writer.write(message.generator(writer.getValue()))
      break
    }
    case "exec": {
      registry.getCommand(message.command).run(message.message)
      break
    }
    case "reset": {
      const writer = registry.getState<StateWriter<any>>(message.container)
      writer.publish(message.container[initialValue])
      break
    }
    case "clear": {
      const publisher = registry.getState<IndexedStatePublisher<any, any>>(message.collection)
      publisher.clear()
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
