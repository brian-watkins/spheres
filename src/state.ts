export interface State<T> {
  onChange(notify: (updatedState: T) => void): void
}

export interface Container<T> extends State<T> {
  _containerBrand: any
}

export type LoopMessage<T> = WriteValueMessage<T> | RefreshValueMessage<T>

export class Loop {
  private connections = new WeakMap<State<any>, (value: any) => void>()
  private writers = new WeakMap<State<any>, (value: any) => void>()
  private storage = new WeakMap<State<any>, any>()

  registerProvider(provider: Provider) {
    const dependencies = new Set<State<any>>()

    const set = <Q>(state: State<Q>, value: Q) => {
      this.connections.get(state)?.({ type: "write", value })
    }

    const get = <S>(state: State<S>) => {
      if (!dependencies.has(state)) {
        dependencies.add(state)
        let initialUpdate = true
        state.onChange(() => {
          if (initialUpdate) {
            initialUpdate = false
            return
          }
          provider.provide(get, set)
        })
      }

      return this.storage.get(state)
    }

    provider.provide(get, set)
  }

  registerWriter<Q>(container: Container<Q>, writer: Writer<Q>) {
    this.writers.set(container, (message) => {
      writer.write(message.value, (state) => this.storage.get(state), (value) => {
        this.connections.get(container)?.(refreshMessage(container, value))
      })
    })
  }

  createContainer<T>(initialState: T): Container<T> {
    const self = this
    const container = new BasicContainer<T>(function (this: BasicContainer<T>) {
      return self.storage.get(this)
    })
    this.storage.set(container, initialState)

    this.connections.set(container, (message: LoopMessage<T>) => {
      this.storage.set(container, message.value)
      container.notifySubscribers(message.value)
    })

    return container
  }

  // PROBLEM: Note that we are assuming here that the derivation function always
  // calls get with ALL atoms it depends on ... but given logic or conditionals in
  // the function that might not be true ...

  // PROBLEM: What if there are no atoms identified at all in the derivation?
  deriveContainer<T>(derivation: (get: <S>(state: State<S>) => S) => T): Container<T> {
    let atomsToRegister: Set<State<any>> = new Set()
    const getCurrentValue = <P>(atom: State<P>) => {
      atomsToRegister.add(atom)
      return this.storage.get(atom)
    }

    const initialValue = derivation(getCurrentValue)

    const atom = this.createContainer(initialValue)

    const getUpdatedValue = <P>(state: State<P>): P => {
      return this.storage.get(state)
    }

    atomsToRegister.forEach((basic) => {
      basic.onChange(() => {
        this.connections.get(atom)?.(refreshMessage(atom, derivation(getUpdatedValue)))
      })
    })

    return atom
  }

  dispatch<T>(message: LoopMessage<T>) {
    const writer = this.writers.get(message.state)
    if (writer) {
      writer(message)
    } else {
      this.connections.get(message.state)?.(message)
    }
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

  onChange(notify: (updatedState: T) => void): void {
    notify(this.get())
    this.subscribers.add(notify)
  }
}

export interface RefreshValueMessage<T> {
  type: "read"
  value: T
  state: State<T>
}

function refreshMessage<T>(state: State<T>, value: T): RefreshValueMessage<T> {
  return {
    type: "read",
    value,
    state
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

export function withDerivedValue<T>(derivation: (get: <S>(atom: State<S>) => S) => T): StateInitializer<T> {
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