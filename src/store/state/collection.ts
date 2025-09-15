import { ClearMessage, WritableState } from "../message.js"
import { createPublisher, IndexableState, IndexableStateReference, IndexableStatePublisher, StatePublisher, TokenRegistry } from "../tokenRegistry.js"
import { MessageDispatchingStateWriter, UpdateResult } from "./publisher/messageDispatchingStateWriter.js"
import { StateWriter } from "./publisher/stateWriter.js"

export interface CollectionInitializer<Key, Value, Message = Value> {
  initialValues: (id: Key) => Value,
  update?: (message: Message, current: Value) => UpdateResult<Value>
  name?: string
}

export function collection<Key, Value, Message = Value>(initializer: CollectionInitializer<Key, Value, Message>): Collection<Key, Value, Message> {
  const token = new CollectionState(initializer.name, initializer.initialValues, initializer.update)
  return {
    [collectionToken]: token,
    at: (index: Key) => [token, index]
  }
}

export function clear(collection: Collection<any, any>): ClearMessage {
  return {
    type: "clear",
    collection: collection[collectionToken]
  }
}

const collectionToken = Symbol("token")

export interface Collection<Key, Value, Message = Value> {
  [collectionToken]: CollectionState<Key, Value, Message>
  at(index: Key): IndexableStateReference<Key, CollectionState<Key, Value, Message>>
}

export class CollectionState<Key, Value, Message = Value> extends WritableState<Value, Message> implements IndexableState<Key, Value> {
  constructor(
    name: string | undefined,
    private generator: (id: Key) => Value,
    update: ((message: Message, current: Value) => UpdateResult<Value>) | undefined,
  ) {
    super(name, update)
  }

  [createPublisher](registry: TokenRegistry): IndexableStatePublisher<Key, Value> {
    return new ReactiveContainerCollection(registry, this.generator, this.update)
  }
}

class ReactiveContainerCollection<Key, Value, Message> extends StatePublisher<Value> implements IndexableStatePublisher<Key, Value> {
  private writers = new Map<Key, any>()

  constructor(private registry: TokenRegistry, private generator: (id: Key) => Value, private reducer?: (message: Message, current: Value) => UpdateResult<Value>) {
    super()
  }

  addListener(): void { }
  getValue(): any { }

  indexedBy<C extends StatePublisher<Value>>(id: Key): C {
    let writer = this.writers.get(id)
    if (writer === undefined) {
      const initialValue = this.generator(id)
      writer = this.reducer ?
        new MessageDispatchingStateWriter(this.registry, initialValue, this.reducer) :
        new StateWriter(initialValue)
      this.writers.set(id, writer)
    }
    return writer
  }

  clear(): void {
    this.writers.clear()
  }
}
