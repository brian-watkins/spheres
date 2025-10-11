import { ClearMessage, WritableState } from "../message.js"
import { createPublisher, StatePublisher, TokenRegistry, State, getPublisher } from "../tokenRegistry.js"
import { MessageDispatchingStateWriter, UpdateResult } from "./publisher/messageDispatchingStateWriter.js"
import { ValueWriter } from "./publisher/valueWriter.js"

export interface CollectionInitializer<Key, Value, Message = Value> {
  initialValues: (id: Key) => Value,
  update?: (message: Message, current: Value) => UpdateResult<Value>
  name?: string
}

export function collection<Key, Value, Message = Value>(initializer: CollectionInitializer<Key, Value, Message>): Collection<Key, Value, Message> {
  const token = new CollectionState(initializer.name, initializer.initialValues, initializer.update)
  return {
    [collectionToken]: token,
    at: (index: Key) => {
      return {
        [getPublisher](registry) {
          const indexedPublisher = registry.getState<ReactiveContainerCollection<Key, Value, Message>>(token)
          return indexedPublisher.indexedBy(index)
        },
        toString() {
          return `${token.toString()}[${index}]`
        }
      }
    }
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
  at(index: Key): WritableState<Value, Message>
}

export class CollectionState<Key, Value, Message = Value> extends State<Value> {
  constructor(
    name: string | undefined,
    private generator: (id: Key) => Value,
    private update: ((message: Message, current: Value) => UpdateResult<Value>) | undefined,
  ) {
    super(name)
  }

  [createPublisher](registry: TokenRegistry): ReactiveContainerCollection<Key, Value, Message> {
    return new ReactiveContainerCollection(registry, this.generator, this.update)
  }
}

export class ReactiveContainerCollection<Key, Value, Message> extends StatePublisher<Value> {
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
        new ValueWriter(initialValue)
      this.writers.set(id, writer)
    }
    return writer
  }

  clear(): void {
    this.writers.clear()
  }
}
