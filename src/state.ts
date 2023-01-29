import { Managed, ManagedValue, StateManager } from "./stateManager"

export interface State<T> {
  value: T
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

  manageState<T>(state: State<Managed<T>>, stateManager: StateManager<T>) {
    stateManager.onChange((value) => {
      this.connections.get(state)?.(value)
    })
  }

  createContainer<T>(initialState: T): Container<T> {
    const container = new BasicContainer(initialState)

    this.connections.set(container, (value) => {
      container.setValue(value)
    })

    return container
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
  private _value: T

  constructor(initialValue: T) {
    this._value = initialValue
  }

  get value(): T {
    return this._value
  }

  setValue(value: T) {
    this._value = value
    this.subscribers.forEach(notify => notify(this.value))
  }

  onChange(notify: (updatedState: T) => void): void {
    notify(this.value)
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

// PROBLEM: Note that we are assuming here that the derivation function always
// calls get with ALL atoms it depends on ... but given logic or conditionals in
// the function that might not be true ...

export function view<T>(loop: Loop, stateValue: ManagedValue<T>): State<Managed<T>> {
  return container(loop, stateValue.initialState)
}

// PROBLEM: What if there are no atoms identified at all in the derivation?
export function derive<T>(loop: Loop, derivation: (get: <S>(atom: State<S>) => S) => T): State<T> {
  let atomsToRegister: Set<State<any>> = new Set()
  const getCurrentValue = <P>(atom: State<P>) => {
    atomsToRegister.add(atom)
    return atom.value
  }

  const initialValue = derivation(getCurrentValue)

  const atom = container(loop, initialValue)

  const getUpdatedValue = <P>(state: State<P>): P => {
    return state.value
  }

  atomsToRegister.forEach((basic) => {
    basic.onChange(() => {
      loop.dispatch(atom.updateRequest(derivation(getUpdatedValue)))
    })
  })

  return atom
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