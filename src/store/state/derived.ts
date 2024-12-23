import { AbstractStatePublisher } from "./publisher/abstractStatePublisher.js";
import { didCreateToken } from "./stateRecorder.js";
import { GetState, listenerVersion, reactiveState, State, StatePublisher, StateListener, TokenRegistry, createPublisher } from "../tokenRegistry.js";

export interface DerivedStateInitializer<T> {
  id?: string
  query: (get: GetState) => T
  name?: string
}

export function derived<T>(initializer: DerivedStateInitializer<T> | ((get: GetState) => T)): DerivedState<T> {
  const token = typeof initializer === "function" ?
    new DerivedState(undefined, undefined, initializer) :
    new DerivedState(initializer.id, initializer.name, initializer.query)
  didCreateToken(token)
  return token
}


export class DerivedState<T> extends State<T> {
  constructor(id: string | undefined, name: string | undefined, private derivation: (get: GetState) => T) {
    super(id, name)
  }

  [createPublisher](registry: TokenRegistry): StatePublisher<T> {
    return new DerivedStatePublisher(registry, this.derivation)
  }
}

class DerivedStatePublisher<T> extends AbstractStatePublisher<T> implements StateListener {
  private _value: T
  [listenerVersion] = 0;

  constructor(registry: TokenRegistry, private derivation: (get: GetState) => T) {
    super(registry)
    this._value = this.derivation(reactiveState(registry, this))
  }

  run(_: GetState): void {
    const derived = this.derivation(reactiveState(this.registry, this))

    if (Object.is(derived, this._value)) {
      return
    }

    this._value = derived

    this.runListeners()
  }

  getValue(): T {
    return this._value
  }
}
