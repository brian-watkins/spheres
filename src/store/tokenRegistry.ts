export const getStateHandler = Symbol("getStateHandler")

export interface StateReference<Value> {
  [getStateHandler](registry: TokenRegistry): StateReader<Value>
}

export type GetState = <S>(state: StateReference<S>) => S

export type Stateful<T> = (get: GetState) => T | undefined

function subscribeOnGet<T>(this: Subscriber, token: StateReference<T>): T {
  const reader = token[getStateHandler](this.registry)
  reader.addSubscriber(this)
  return reader.getValue()
}

export function getStateFunctionWithListener(key: Subscriber): GetState {
  return subscribeOnGet.bind(key) as GetState
}

export function runQuery<M>(registry: TokenRegistry, query: (get: GetState) => M): M {
  return query((token) => token[getStateHandler](registry).getValue())
}

export function generateStateManager<S>(registry: TokenRegistry, token: State<S>): StateReader<S> {
  return token[createStateHandler](registry)
}

export const createController = Symbol("createController")
export const createStateHandler = Symbol("createStateHandler")

export abstract class State<T> implements StateReference<T> {
  constructor(readonly name: string | undefined) { }

  abstract [createStateHandler](registry: TokenRegistry): StateReader<T>

  abstract [getStateHandler](registry: TokenRegistry): StateReader<T>

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

export interface Subscribable {
  addSubscriber(subscriber: Subscriber): void
  removeSubscriber(subscriber: Subscriber): void
}

export interface StateReader<T> extends Subscribable {
  getValue(): T
}

export interface StatePublisher<T> extends StateReader<T> {
  publish(value: T): void
}

export interface StateWriter<T, M> extends StatePublisher<T> {
  write(value: M): void
}

export interface PublishableState<T> extends StateReference<T> {
  [getStateHandler](registry: TokenRegistry): StatePublisher<T>
}

export interface WritableState<T, M> extends StateReference<T> {
  [getStateHandler](registry: TokenRegistry): StateWriter<T, M>
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

export type Token = State<unknown> | Command<unknown>

export type StateHandler<S extends State<unknown>> = ReturnType<S[typeof getStateHandler]>

export interface TokenRegistry {
  onRegister(handler: (token: Token) => void): void
  getState<S extends State<unknown>>(token: S): StateHandler<S>
  setState<T>(state: State<T>, publisher: StateReader<T>): void
  getCommand(token: Command<unknown>): CommandController<unknown>
  setCommand(token: Command<unknown>, controller: CommandController<unknown>): void
}
