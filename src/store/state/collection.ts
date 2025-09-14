import { ClearMessage, WritableState } from "../message.js"
import { createPublisher, IndexableState, IndexableStateReference, IndexedStatePublisher, StatePublisher, TokenRegistry } from "../tokenRegistry.js"
import { MessageDispatchingStateWriter, UpdateResult } from "./publisher/messageDispatchingStateWriter.js"
import { StateWriter } from "./publisher/stateWriter.js"

export interface CollectionInitializer<Key, Value, Message = Value> {
  initialValues: (id: Key) => Value,
  update?: (message: Message, current: Value) => UpdateResult<Value>
  name?: string
}

export function collection<Key, Value, Message = Value>(initializer: CollectionInitializer<Key, Value, Message>): Collection<Key, Value, Message> {
  return new Collection(initializer.name, initializer.initialValues, initializer.update)
}

export function clear(collection: Collection<any, any>): ClearMessage {
  return {
    type: "clear",
    collection
  }
}

export class Collection<Key, Value, Message = Value> extends WritableState<Value, Message> implements IndexableState<Key>  {
  constructor(
    name: string | undefined,
    private generator: (id: Key) => Value,
    update: ((message: Message, current: Value) => UpdateResult<Value>) | undefined,
  ) {
    super(name, update)
  }

  [createPublisher](registry: TokenRegistry): StatePublisher<Value> {
    return new ReactiveContainerCollection(registry, this.generator, this.update)
  }

  at(index: Key): IndexableStateReference<Key, this> {
    return [this, index]
  }
}

class ReactiveContainerCollection<Key, Value, Message> extends IndexedStatePublisher<Key, Value> {
  private writers = new Map<Key, any>()

  constructor(private registry: TokenRegistry, private generator: (id: Key) => Value, private reducer?: (message: Message, current: Value) => UpdateResult<Value>) {
    super()
  }

  addListener(): void { }

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

  getValue(): any { }

  clear(): void {
    this.writers.clear()
  }
}
