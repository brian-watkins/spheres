
export interface State<T> {
  initialState: T
  onChange(notify: (updatedState: T) => void): void
}

export interface LoopMessage {
  type: string
}

export class Loop {
  private storage = new WeakMap<State<any>, any>()

  readState<T>(state: State<T>): T {
    return this.storage.get(state) ?? state.initialState
  }

  dispatch(message: LoopMessage) {
    switch (message.type) {
      case "set-state":
        const setStateMessage = message as SetStateMessage<any>
        this.storage.set(setStateMessage.root, setStateMessage.value)
        setStateMessage.root.notifySubscribers()
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

export class Root<T> implements State<T> {
  private subscribers: Set<((updatedState: T) => void)> = new Set()

  constructor(public loop: Loop, private initialValue: T) {}

  get initialState(): T {
    return this.initialValue
  }

  notifySubscribers() {
    this.subscribers.forEach(notify => notify(this.loop.readState(this)))
  }

  onChange(notify: (updatedState: T) => void): void {
    notify(this.loop.readState(this))
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

export function root<T>(loop: Loop, initialValue: T): Root<T> { 
  return new Root(loop, initialValue)
}

// PROBLEM: Note that we are assuming here that the derivation function always
// calls get with ALL atoms it depends on ... but given logic or conditionals in
// the function that might not be true ...

// PROBLEM: What if there are no atoms identified at all in the derivation?
export function derive<T>(loop: Loop, derivation: (get: <S>(atom: State<S>) => S) => T): State<T> {
  let atomsToRegister: Set<State<any>> = new Set()
  const getCurrentValue = <P>(atom: State<P>) => {
    atomsToRegister.add(atom)
    return loop.readState(atom)
  }
  
  const initialValue = derivation(getCurrentValue)

  const atom = new Root(loop, initialValue)

  const getUpdatedValue = <P>(state: State<P>) => {
    return loop.readState(state)
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
  root: Root<T>
  value: T
}

export function setState<T>(root: Root<T>, value: T): SetStateMessage<T> {
  return {
    type: "set-state",
    root,
    value
  }
}