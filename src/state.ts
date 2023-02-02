import { Managed, StateManager } from "./stateManager"

export interface State<T> {
  onChange(notify: (updatedState: T) => void): void
}

export interface Container<T> extends State<T> {
  updateRequest(value: T): SetStateMessage<T>
}

export interface LoopMessage {
  type: string
}

export class Loop {
  private connections = new WeakMap<State<any>, (value: any) => void>()
  private storage = new WeakMap<State<any>, any>()

  manageState<T, K>(state: State<Managed<T, K>>, stateManager: StateManager<T, K>) {
    const connection = this.connections.get(state)
    if (!connection) return

    this.connections.set(state, (value) => {
      connection(value)
      stateManager.refreshState(value.key)
    })

    stateManager.onChange(connection)

    stateManager.refreshState(this.storage.get(state).key)
  }

  createContainer<T>(initialState: T): Container<T> {
    const self = this
    const container = new BasicContainer<T>(function (this: BasicContainer<T>) {
      return self.storage.get(this)
    })
    this.storage.set(container, initialState)

    this.connections.set(container, (value) => {
      this.storage.set(container, value)
      container.notifySubscribers(value)
    })

    return container
  }

  managedContainer<T, K>(keyDerivation?: (get: <S>(state: State<S>) => S) => K): State<Managed<T, K>> {
    if (!keyDerivation) {
      return this.createContainer({ type: "loading" })
    }

    return this.deriveContainer((get) => {
      return {
        type: "loading",
        key: keyDerivation(get)
      }
    })
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
        this.dispatch(atom.updateRequest(derivation(getUpdatedValue)))
      })
    })

    return atom
  }

  dispatch(message: LoopMessage) {
    switch (message.type) {
      case "set-state":
        const setStateMessage = message as SetStateMessage<any>
        this.connections.get(setStateMessage.root)?.(setStateMessage.value)
        break
      default:
        console.log("Unknown message", message)
    }
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

  updateRequest(value: T): SetStateMessage<T> {
    return {
      type: "set-state",
      root: this,
      value
    }
  }
}

export function container<T>(loop: Loop, initialValue: T): Container<T> {
  return loop.createContainer(initialValue)
}

export function manage<T, K>(loop: Loop, keyDerivation?: (get: <S>(atom: State<S>) => S) => K): State<Managed<T, K>> {
  return loop.managedContainer(keyDerivation)
}

export function derive<T>(loop: Loop, derivation: (get: <S>(atom: State<S>) => S) => T): State<T> {
  return loop.deriveContainer(derivation)
}

export interface SetStateMessage<T> extends LoopMessage {
  type: "set-state"
  root: Container<T>
  value: T
}

export function setState<T>(root: Container<T>, value: T): SetStateMessage<T> {
  return {
    type: "set-state",
    root,
    value
  }
}