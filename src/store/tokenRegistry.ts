export const getPublisher = Symbol("getPublisher")

export interface StateReference<Value> {
  [getPublisher](registry: TokenRegistry): StatePublisher<Value>
}

export type GetState = <S>(state: StateReference<S>) => S

export type Stateful<T> = (get: GetState) => T | undefined

function subscribeOnGet(this: Subscriber, token: StateReference<any>): any {
  const publisher = token[getPublisher](this.registry)
  publisher.addListener(this)
  return publisher.getValue()
}

export function getStateFunctionWithListener(key: Subscriber): GetState {
  return subscribeOnGet.bind(key) as GetState
}

export function runQuery<M>(registry: TokenRegistry, query: (get: GetState) => M): M {
  return query((token) => token[getPublisher](registry).getValue())
}

export function createStatePublisher(registry: TokenRegistry, token: State<any>, initialValue?: any): StatePublisher<any> {
  return token[createPublisher](registry, initialValue)
}

export const createController = Symbol("createController")
export const createPublisher = Symbol("createPublisher")

export abstract class State<T> implements StateReference<T> {
  constructor(readonly name: string | undefined) { }

  abstract [createPublisher](registry: TokenRegistry, initialState?: T): StatePublisher<T>

  [getPublisher]<X extends StatePublisher<T>>(registry: TokenRegistry): X {
    return registry.getState(this)
  }

  toString() {
    return this.name ?? "State"
  }
}

export type StateListenerVersion = number

export enum StateListenerType {
  Derivation, SystemEffect, UserEffect
}

export interface StateDerivation {
  readonly type: StateListenerType.Derivation
  notifyListeners: (userEffects: Array<Subscriber>) => void
  init(get: GetState, context?: any): void
  run(get: GetState, context?: any): void
}

export interface StateEffect {
  readonly type: StateListenerType.SystemEffect | StateListenerType.UserEffect
  init(get: GetState, context?: any): void
  run(get: GetState, context?: any): void
}

export type StateListener = StateEffect | StateDerivation

export function initListener(registry: TokenRegistry, listener: StateListener, context?: any): Subscriber {
  const subscriber = createSubscriber(registry, listener, context)
  listener.init(getStateFunctionWithListener(subscriber), context)
  return subscriber
}

export function runListener(key: Subscriber) {
  key.version = key.version + 1
  key.listener.run(getStateFunctionWithListener(key), key.context)
  key.parent = undefined
}

export interface Subscriber {
  registry: TokenRegistry
  listener: StateListener
  version: StateListenerVersion
  parent: any
  context: any
}

export interface StatePublisher<T> {
  getValue(): T
  addListener(subscriber: Subscriber): void
  removeListener(subscriber: Subscriber): void
  notifyListeners(userEffects: Array<Subscriber>): void
  runListeners(): void
  runUserEffects(subscribers: Array<Subscriber>): void
}

export function createSubscriber(registry: TokenRegistry, listener: StateListener, context?: any): Subscriber {
  return {
    registry,
    listener,
    version: 0,
    parent: undefined,
    context
  }
}

export interface CommandController<T> {
  run(message: T): void
}

export const initializeCommand = Symbol("initializeCommand")

export abstract class Command<M> {
  constructor(readonly name: string | undefined) { }

  abstract [createController](registry: TokenRegistry): CommandController<M>

  abstract [initializeCommand](registry: TokenRegistry): void

  toString() {
    return this.name ?? "Command"
  }
}

export type Token = State<any> | Command<any>

export interface TokenRegistry {
  onRegister(handler: (token: Token) => void): void
  getState<C extends StatePublisher<any>>(token: State<any>): C
  setState(state: State<any>, publisher: StatePublisher<any>): void
  getCommand(token: Command<any>): CommandController<any>
  setCommand(token: Command<any>, controller: CommandController<any>): void
}
