import { run, StoreMessage } from "../message.js"
import { createPublisher, State, StateListener, StatePublisher, TokenRegistry } from "../tokenRegistry.js"
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

export class Collection<Key, Value, Message = Value> extends State<CollectionActions<Key, Value, Message>> {
  constructor(
    name: string | undefined,
    private generator: (id: Key) => Value,
    private update: ((message: Message, current: Value) => UpdateResult<Value>) | undefined,
  ) {
    super(name)
  }

  [createPublisher](registry: TokenRegistry): StatePublisher<CollectionActions<Key, Value, Message>> {
    return new ReactiveContainerCollection(registry, this.generator, this.update)
  }
}

export interface CollectionActions<Key, Value, Message> {
  get(id: Key): Value
  write(id: Key, message: Message): StoreMessage
  update(id: Key, generator: (current: NoInfer<Value>) => NoInfer<Message>): StoreMessage
  clear(): StoreMessage
}

class ReactiveContainerCollection<Key, Value, Message> extends StatePublisher<CollectionActions<Key, Value, Message>> implements CollectionActions<Key, Value, Message> {
  private writers = new Map<Key, StateWriter<Value>>()
  private currentListener: StateListener | undefined

  constructor(private registry: TokenRegistry, private generator: (id: Key) => Value, private reducer?: (message: Message, current: Value) => UpdateResult<Value>) {
    super()
  }

  private getStateWriter(id: Key): StateWriter<Value> {
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

  addListener(listener: StateListener): void {
    this.currentListener = listener
  }

  private writeMessage(id: Key, message: Message): void {
    const writer = this.getStateWriter(id)
    writer.write(message)
  }

  private writeUpdate(id: Key, generator: (current: Value) => Message): void {
    const writer = this.getStateWriter(id)
    writer.write(generator(writer.getValue()))
  }

  private clearCollection(): void {
    this.writers.clear()
    this.currentListener = undefined
  }

  getValue(): CollectionActions<Key, Value, Message> {
    return this
  }

  get(id: Key): Value {
    const writer = this.getStateWriter(id)
    if (this.currentListener !== undefined) {
      writer.addListener(this.currentListener)
    }
    return writer.getValue()
  }

  write(id: Key, message: Message): StoreMessage {
    return run(() => this.writeMessage(id, message))
  }

  update(id: Key, generator: (current: Value) => Message): StoreMessage {
    return run(() => this.writeUpdate(id, generator))
  }

  clear(): StoreMessage {
    return run(() => this.clearCollection())
  }
}
