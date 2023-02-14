export interface State<T> {
  subscribe(notify: (updatedState: T) => void): () => void
}

export interface Container<T> extends State<T> {
  _containerBrand: any
}

export type LoopMessage<T> = WriteValueMessage<T>

export class Loop {
  private registry = new WeakMap<State<any>, MetaContainer<any>>()

  registerProvider(provider: Provider) {
    const queryDependencies = new Set<State<any>>()

    const set = <Q>(state: State<Q>, value: Q) => {
      this.registry.get(state)?.refreshValue(value)
    }

    const get = <S>(state: State<S>) => {
      if (!queryDependencies.has(state)) {
        queryDependencies.add(state)
        this.registry.get(state)?.addDependent(() => provider.provide(get, set))
      }

      return this.registry.get(state)?.value
    }

    provider.provide(get, set)
  }

  registerWriter<Q>(container: Container<Q>, writer: Writer<Q>) {
    this.registry.get(container)?.setWriter(writer)
  }

  createContainer<T>(initialState: T): Container<T> {
    const self = this
    const container = new BasicContainer<T>(function (this: BasicContainer<T>) {
      return self.registry.get(this)?.value
    })

    this.registry.set(container, new MetaContainer(container, initialState, (state) => this.registry.get(state)?.value))

    return container
  }

  deriveContainer<T>(derivation: (get: <S>(state: State<S>) => S) => T): Container<T> {
    let dependencies: Set<State<any>> = new Set()

    let container: Container<T>

    const get = <P>(state: State<P>): P => {
      if (!dependencies.has(state)) {
        dependencies.add(state)
        this.registry.get(state)?.addDependent(() => {
          this.registry.get(container)?.refreshValue(derivation(get))
        })
      }
      return this.registry.get(state)?.value
    }

    container = this.createContainer(derivation(get))

    return container
  }

  dispatch<T>(message: LoopMessage<T>) {
    this.registry.get(message.state)?.writeValue(message.value)
  }
}

class MetaContainer<S> {
  private writer = (value: S) => this.refreshValue(value)
  private dependents = new Set<(value: S) => void>()
  
  constructor(private container: BasicContainer<S>, private _value: S, private get: <Q>(state: State<Q>) => Q) {}

  setWriter(writer: Writer<S>) {
    this.writer = (value) => {
      writer.write(value, this.get, (value) => {
        this.refreshValue(value)
      })
    }
  }

  addDependent(notifier: (value: S) => void) {
    this.dependents.add(notifier)
  }

  get value(): S {
    return this._value
  }

  refreshValue(value: S) {
    this._value = value
    this.dependents.forEach(notify => notify(value))
    this.container.notifySubscribers(value)
  }

  writeValue(value: S) {
    this.writer(value)
  }
}

// I guess the other problem with this is that now you
// have strong references to subscribers? which means that
// subscribers (ie derived state) will never be released from
// memory? not sure ... Or if there is a derived view, and it
// is removed from the DOM ... should it unsubscribe? not sure ...

class BasicContainer<T> implements Container<T> {
  _containerBrand: any
  public subscribers: Set<((updatedState: T) => void)> = new Set()

  constructor(private get: () => T) { }

  notifySubscribers(value: T) {
    this.subscribers.forEach(notify => notify(value))
  }

  subscribe(notify: (updatedState: T) => void): () => void {
    notify(this.get())
    this.subscribers.add(notify)

    return () => {
      this.subscribers.delete(notify)
    }
  }
}

export interface WriteValueMessage<T> {
  type: "write"
  value: T
  state: State<T>
}

export function writeMessage<T>(container: Container<T>, value: T): WriteValueMessage<T> {
  return {
    type: "write",
    value,
    state: container
  }
}

interface ContainerInitializer<T> extends StateInitializer<T> {
  initialize(loop: Loop): Container<T>
}

interface StateInitializer<T> {
  initialize(loop: Loop): State<T>
}

export function withInitialValue<T>(value: T): ContainerInitializer<T> {
  return {
    initialize: (loop) => {
      return loop.createContainer(value)
    }
  }
}

export function withDerivedValue<T>(derivation: (get: <S>(state: State<S>) => S) => T): StateInitializer<T> {
  return {
    initialize: (loop) => {
      return loop.deriveContainer(derivation)
    }
  }
}

export function container<T>(initializer: ContainerInitializer<T>, loop: Loop): Container<T> {
  return initializer.initialize(loop)
}

export function state<T>(initializer: StateInitializer<T>, loop: Loop): State<T> {
  return initializer.initialize(loop)
}

// Provider stuff

export interface Provider {
  provide(get: <S>(state: State<S>) => S, set: <Q>(state: State<Q>, value: Q) => void): void | Promise<void>
}

export function useProvider(provider: Provider, loop: Loop) {
  loop.registerProvider(provider)
}

// Writer stuff

export interface Writer<T> {
  write(value: T, get: <S>(state: State<S>) => S, set: (value: T) => void): void 
}

export function useWriter<T>(container: Container<T>, writer: Writer<T>, loop: Loop) {
  loop.registerWriter(container, writer)
}