export interface Token {
  id: string | undefined
}

export type GetState = <S>(state: State<S>) => S

function getState(listener: StateListener): GetState {
  return function (token) {
    const publisher = listener.registry.get<StatePublisher<any>>(token)
    publisher.addListener(listener)
    return publisher.getValue()
  }
}

export function createStatePublisher(registry: TokenRegistry, token: State<any>, initialValue?: any): StatePublisher<any> {
  return token[createPublisher](registry, initialValue)
}

export const createController = Symbol("createController")
export const createPublisher = Symbol("createPublisher")

export abstract class State<T> implements Token {
  constructor(readonly id: string | undefined, readonly name: string | undefined) { }

  abstract [createPublisher](registry: TokenRegistry, initialState?: T): StatePublisher<T>

  toString() {
    return this.name && this.id ? `${this.name}-${this.id}` : (this.name ?? this.id ?? "State")
  }
}

export type StateListenerVersion = number

export interface StateListener {
  registry: TokenRegistry
  parent?: {}
  version?: StateListenerVersion
  overrideVersionTracking?: boolean
  notifyListeners?: () => void
  init(get: GetState): void
  run(get: GetState): void
}

export function initListener(listener: StateListener) {
  listener.version = 0
  listener.init(getState(listener))
}

export abstract class StatePublisher<T> {
  private listeners: Map<StateListener, StateListenerVersion> = new Map()

  abstract getValue(): T

  addListener(listener: StateListener) {
    this.listeners.set(listener, listener.version!)
  }

  removeListener(listener: StateListener) {
    this.listeners.delete(listener)
  }

  notifyListeners() {
    for (const [listener, token] of this.listeners) {
      if (token === listener.version || listener.overrideVersionTracking) {
        listener.parent = this
        listener.notifyListeners?.()
      } else {
        this.removeListener(listener)
      }
    }
  }

  runListeners() {
    for (const listener of this.listeners.keys()) {
      if (listener.parent === this) {
        listener.version = listener.version! + 1
        listener.run(getState(listener))
        listener.parent = undefined
      }
    }
  }
}

export const initializeCommand = Symbol("initializeCommand")

export abstract class Command<M> implements Token {
  constructor(readonly id: string | undefined, readonly name: string | undefined) { }

  abstract [createController](registry: TokenRegistry): CommandController<M>
  
  abstract [initializeCommand](registry: TokenRegistry): void

  toString() {
    return this.name && this.id ? `${this.name}-${this.id}` : (this.name ?? this.id ?? "Command")
  }
}

export interface CommandController<T> {
  run(message: T): void
}

export interface TokenRegistry {
  get<C>(token: Token): C
  set(token: Token, controller: any): void
  registerState<T>(token: State<T>, initialState?: T): StatePublisher<T>
  registerCommand<T>(token: Command<T>): CommandController<T>
}