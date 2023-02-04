import { Managed } from "./stateManager"

export interface State<T> {
  onChange(notify: (updatedState: T) => void): void
}

export interface Container<T> extends State<T> {}

export interface StateManager<T, K = void> {
  update(message: LoopMessage<Managed<T, K>>): void
  onChange(callback: (value: Managed<T, K>) => void): void
}

interface Valuable<T> {
  value: T
}

export interface LoopMessage<T> extends Valuable<T> {
  type: string
  value: T
  container: Container<T>
}

export class Loop {
  private connections = new WeakMap<State<any>, (value: any) => void>()
  private storage = new WeakMap<State<any>, any>()

  // This is probably something we can remove ...
  // IF we pass in the manager when defining the state and the
  // container and derived functions get more sophisticated
  manageState<T, K>(state: State<Managed<T, K>>, stateReader: StateManager<T, K>) {
    const connection = this.connections.get(state)
    if (!connection) {
      console.log("NO connection!??!")
      return
    }

    this.connections.set(state, (message) => {
      connection(message)
      stateReader.update(message)
    })

    stateReader.onChange(connection)

    // is this always the right thing to do?
    stateReader.update({ type: "read", value: this.storage.get(state), container: state })
  }

  createContainer<T>(initialState: T): Container<T> {
    const self = this
    const container = new BasicContainer<T>(function (this: BasicContainer<T>) {
      return self.storage.get(this)
    })
    this.storage.set(container, initialState)

    this.connections.set(container, (message: Valuable<T>) => {
      this.storage.set(container, message.value)
      container.notifySubscribers(message.value)
    })

    return container
  }

  // PROBLEM: Note that we are assuming here that the derivation function always
  // calls get with ALL atoms it depends on ... but given logic or conditionals in
  // the function that might not be true ...

  // PROBLEM: What if there are no atoms identified at all in the derivation?
  deriveContainer<T>(derivation: (get: <S>(state: State<S>) => S) => T): State<T> {
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
        this.connections.get(atom)?.({
          type: "read",
          value: derivation(getUpdatedValue)
        })
      })
    })

    return atom
  }

  dispatch<T>(message: LoopMessage<T>) {
    this.connections.get(message.container)?.(message)
  }
}

// I guess the other problem with this is that now you
// have strong references to subscribers? which means that
// subscribers (ie derived state) will never be released from
// memory? not sure ... Or if there is a derived view, and it
// is removed from the DOM ... should it unsubscribe? not sure ...

class BasicContainer<T> implements Container<T> {
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

export interface WriteValueMessage<T> extends LoopMessage<T> {
  type: "write"
  value: T
  container: Container<T>
}

export function managedWriter<T, K>(container: Container<Managed<T, K>>): (value: T) => WriteValueMessage<Managed<T, K>> {
  return (value) => ({
    type: "write",
    value: {
      type: "writing",
      value
    },
    container
  })
}

export function writer<T>(container: Container<T>): (value: T) => WriteValueMessage<T> {
  return (value) => ({
    type: "write",
    value,
    container
  })
}

export function container<T>(loop: Loop, initialValue: T): Container<T> {
  return loop.createContainer(initialValue)
}

export function manage<T, K>(loop: Loop, keyDerivation?: (get: <S>(atom: State<S>) => S) => K): State<Managed<T, K>> {
  return loop.deriveContainer((get) => {
    return {
      type: "loading",
      key: keyDerivation?.(get)
    }
  })
}

export function manageContainer<T>(loop: Loop): Container<Managed<T, void>> {
  return loop.createContainer<Managed<T, void>>({ type: "loading" })
}

export function derive<T>(loop: Loop, derivation: (get: <S>(atom: State<S>) => S) => T): State<T> {
  return loop.deriveContainer(derivation)
}
