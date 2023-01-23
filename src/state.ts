import { ViewMessage } from "./view"

export interface State<T> {
  read(): T
  onChange(notify: () => void): void
}

// I guess the other problem with this is that now you
// have strong references to subscribers? which means that
// subscribers (ie derived state) will never be released from
// memory? not sure ...

export class Root<T> implements State<T> {
  private value: T
  private subscribers: Set<(() => void)> = new Set()

  constructor(initialValue: T) {
    this.value = initialValue
  }

  onChange(notify: () => void): void {
    notify()
    this.subscribers.add(notify)
  }

  read(): T {
    return this.value
  }

  write(value: T) {
    this.value = value
    this.subscribers.forEach((notify) => notify())
  }
}


export function root<T>(initialValue: T): Root<T> { 
  return new Root(initialValue)
}

// PROBLEM: Note that we are assuming here that the derivation function always
// calls get with ALL atoms it depends on ... but given logic or conditionals in
// the function that might not be true ...
export function derive<T>(derivation: (get: <S>(atom: State<S>) => S) => T): State<T> {
  let atomsToRegister: Set<State<any>> = new Set()
  const getCurrentValue = <P>(atom: State<P>) => {
    atomsToRegister.add(atom)
    return atom.read()
  }
  
  const initialValue = derivation(getCurrentValue)

  const atom = new Root(initialValue)

  const getUpdatedValue = <P>(state: State<P>) => {
    return state.read()
  }

  atomsToRegister.forEach((basic) => {
    basic.onChange(() => {
      atom.write(derivation(getUpdatedValue))
    })
  })

  return atom
}

export interface SetStateMessage<T> extends ViewMessage {
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