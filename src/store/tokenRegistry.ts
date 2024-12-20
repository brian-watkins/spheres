export interface Token {
  id: string | undefined
}

export type GetState = <S>(state: State<S>) => S

export function reactiveState(registry: TokenRegistry, listener: StateListener): GetState {
  return function (token) {
    const controller = registry.get<StatePublisher<any>>(token)
    controller.addListener(listener)
    return controller.getValue()
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

export const listenerVersion = Symbol("listener-version")
export const listenerParent = Symbol("listener-parent")
export const notifyListeners = Symbol("notify-listeners")
export const listenerStore = Symbol("listener-store")

export interface StateListener {
  [listenerVersion]?: number
  [listenerParent]?: any
  [notifyListeners]?: () => void
  [listenerStore]?: TokenRegistry
  run(get: GetState): void
}

export interface StatePublisher<T> {
  addListener(listener: StateListener): void
  getValue(): T
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

