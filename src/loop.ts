export interface State<T> {
  subscribe(notify: (updatedState: T) => void): () => void
}

export interface Container<T, M = T> extends State<T> {
  _containerBrand: any | M
}

export interface Provider {
  provide(get: <S>(state: State<S>) => S, set: <Q>(state: State<Q>, value: Q) => void): void | Promise<void>
}

export interface Writer<T> {
  write(value: T, get: <S>(state: State<S>) => S, set: (value: T) => void): void 
}

export type LoopMessage<T, M = T> = WriteValueMessage<T, M>

export class Loop {
  private registry = new WeakMap<State<any>, ContainerController<any>>()

  registerProvider(provider: Provider) {
    const queryDependencies = new Set<State<any>>()

    const set = <Q>(state: State<Q>, value: Q) => {
      this.registry.get(state)?.updateValue(value)
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
    const controller = this.registry.get(container)
    if (controller) {
      controller.setWriter((value) => {
        writer.write(value, (state) => this.registry.get(state)?.value, (value) => {
          controller.updateValue(value)
        })
      })
    }
  }

  createContainer<T, M>(initialState: T, update: (message: M, current: T) => T): Container<T, M> {
    const self = this
    const container = new BasicContainer<T>(function (this: BasicContainer<T>) {
      return self.registry.get(this)?.value
    })

    this.registry.set(container, new ContainerController(container, initialState, update))

    return container
  }

  deriveContainer<T>(derivation: (get: <S>(state: State<S>) => S) => T): Container<T> {
    let dependencies: Set<State<any>> = new Set()

    let container: Container<T>

    const get = <P>(state: State<P>): P => {
      if (!dependencies.has(state)) {
        dependencies.add(state)
        this.registry.get(state)?.addDependent(() => {
          this.registry.get(container)?.updateValue(derivation(get))
        })
      }
      return this.registry.get(state)?.value
    }

    container = this.createContainer(derivation(get), (val) => val)

    return container
  }

  dispatch<T, M>(message: LoopMessage<T, M>) {
    this.registry.get(message.state)?.writeValue(message.value)
  }

  reset() {
    this.registry = new WeakMap<State<any>, ContainerController<any>>()
  }
}

class ContainerController<S> {
  private writer = (value: S) => this.updateValue(value)
  private dependents = new Set<(value: S) => void>()
  
  constructor(private container: BasicContainer<S>, private _value: S, private update: (message: any, current: S) => S) {}

  setWriter(writer: (value: S) => void) {
    this.writer = writer
  }

  addDependent(notifier: (value: S) => void) {
    this.dependents.add(notifier)
  }

  get value(): S {
    return this._value
  }

  updateValue(value: S) {
    this._value = this.update(value, this._value)
    this.dependents.forEach(notify => notify(this._value))
    this.container.notifySubscribers(this._value)
  }

  writeValue(value: S) {
    this.writer(value)
  }
}

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

export interface WriteValueMessage<T, M> {
  type: "write"
  value: M
  state: State<T>
}

export function writeMessage<T, M>(container: Container<T, M>, value: M): WriteValueMessage<T, M> {
  return {
    type: "write",
    value,
    state: container
  }
}
