export const getStateHandler = Symbol("getStateHandler")

export interface State<Value> {
  [getStateHandler](registry: TokenRegistry): StateReader<Value>
}

export interface StateToken<Value> extends State<Value> {
  readonly name: string | undefined
  [createStateHandler](registry: TokenRegistry): StateReader<Value>
}

export type GetState = <S>(state: State<S>) => S

export type Stateful<T> = (get: GetState) => T

export function isStateful<T>(value: T | Stateful<T>): value is Stateful<T> {
  return typeof value === "function"
}

export function runQuery<M>(registry: TokenRegistry, query: (get: GetState) => M): M {
  return query((token) => token[getStateHandler](registry).getValue())
}

export function generateStateManager<S>(registry: TokenRegistry, token: StateToken<S>): StateReader<S> {
  return token[createStateHandler](registry)
}

export const createController = Symbol("createController")
export const createStateHandler = Symbol("createStateHandler")

export type StateListenerVersion = number

export enum StateListenerType {
  Derivation, ViewEffect, ElementEffect, UserEffect
}

export interface EffectList extends Iterable<Subscriber> {
  addViewEffect(subscriber: Subscriber): void
  addElementEffect(subscriber: Subscriber): void
  addUserEffect(subscriber: Subscriber): void
}

export interface StateDerivation {
  readonly type: StateListenerType.Derivation
  prepareSubscribers: (effects: EffectList) => void
  notifyStable(): void
  init(get: GetState, context?: any): void
  run(get: GetState, context?: any): void
}

export interface StateEffect {
  readonly type: StateListenerType.ViewEffect | StateListenerType.ElementEffect | StateListenerType.UserEffect
  init(get: GetState, context?: any): void
  run(get: GetState, context?: any): void
}

export type StateListener = StateEffect | StateDerivation

export function initListener(registry: TokenRegistry, listener: StateListener, context?: any): Subscriber {
  const subscriber = createSubscriber(registry, listener, context)
  listener.init(subscriber.generateGetState(), context)
  return subscriber
}

export class Subscriber {
  private version: StateListenerVersion = 0;
  private parent: Subscribable | undefined = undefined;
  private dirty: boolean = false;

  constructor(
    readonly registry: TokenRegistry,
    public listener: StateListener,
    private context?: any
  ) {}

  private subscribeOnGet<T>(token: State<T>): T {
    const reader = token[getStateHandler](this.registry)
    reader.addSubscriber(this)
    return reader.getValue()
  }

  generateGetState(): GetState {
    return this.subscribeOnGet.bind(this)
  }

  getVersion(): StateListenerVersion {
    return this.version;
  }

  prepareForUpdate(dependency: Subscribable, effects: EffectList): void {
    this.parent = dependency
    switch (this.listener.type) {
      case StateListenerType.Derivation:
        this.listener.prepareSubscribers(effects)
        break
      case StateListenerType.ViewEffect:
        effects.addViewEffect(this)
        break
      case StateListenerType.ElementEffect:
        effects.addElementEffect(this)
        break
      case StateListenerType.UserEffect:
        effects.addUserEffect(this)
        break
    }
  }

  dependencyUpdated(dependency: Subscribable): void {
    if (this.parent !== dependency) {
      this.dirty = true;
      return;
    }

    if (this.listener.type === StateListenerType.Derivation) {
      this.runListener();
    } else {
      this.parent = undefined;
      this.dirty = true;
    }
  }

  dependencyStable(dependency: Subscribable): void {
    if (this.parent !== dependency) {
      return;
    }

    if (this.listener.type === StateListenerType.Derivation) {
      if (this.dirty) {
        this.runListener();
      } else {
        this.parent = undefined;
        this.listener.notifyStable();
      }
    }
  }

  run(): void {
    if (this.dirty) {
      this.runListener();
    }
  }

  private runListener() {
    this.version = this.version + 1;
    this.listener.run(this.generateGetState(), this.context)
    this.parent = undefined;
    this.dirty = false;
  }
}

export interface Subscribable {
  addSubscriber(subscriber: Subscriber): void
  removeSubscriber(subscriber: Subscriber): void
}

export interface StateReader<T> extends Subscribable {
  getValue(): T
}

export interface StateBatch {
  add(subscribable: Subscribable): void
  publish(): void
}

export interface StatePublisher<T> extends StateReader<T> {
  publish(value: T, batch?: StateBatch): void
}

export interface StateWriter<T, M = T> extends StatePublisher<T> {
  write(value: M, batch?: StateBatch): void
}

export interface PublishableState<T> extends State<T> {
  [getStateHandler](registry: TokenRegistry): StatePublisher<T>
}

export interface WritableState<T, M = T> extends State<T> {
  [getStateHandler](registry: TokenRegistry): StateWriter<T, M>
}

export function createSubscriber(registry: TokenRegistry, listener: StateListener, context?: any): Subscriber {
  return new Subscriber(registry, listener, context)
}

export interface CommandController<T> {
  run(registry: TokenRegistry, message: T): void
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

export type StateHandler<S extends State<unknown>> = ReturnType<S[typeof getStateHandler]>

export interface TokenRegistry {
  getState<S extends StateToken<unknown>>(token: S): StateHandler<S>
  setState<T>(state: StateToken<T>, publisher: StateReader<T>): void
  getCommand(token: Command<unknown>): CommandController<unknown>
  setCommand(token: Command<unknown>, controller: CommandController<unknown>): void
}
