export type GetState = <S>(state: State<S>) => S

export type Stateful<T> = (get: GetState) => T | undefined

export function subscribeOnGet(listener: StateListener): GetState {
  return function (token) {
    const publisher = listener.registry.getState(token)
    publisher.addListener(listener)
    return publisher.getValue()
  }
}

export function runQuery<M>(registry: TokenRegistry, query: (get: GetState) => M): M {
  return query((token) => {
    const publisher = registry.getState(token)
    return publisher.getValue()
  })
}

export function createStatePublisher(registry: TokenRegistry, token: State<any>, initialValue?: any): StatePublisher<any> {
  return token[createPublisher](registry, initialValue)
}

export const createController = Symbol("createController")
export const createPublisher = Symbol("createPublisher")

export abstract class State<T> {
  constructor(readonly name: string | undefined) { }

  abstract [createPublisher](registry: TokenRegistry, initialState?: T): StatePublisher<T>

  toString() {
    return this.name ?? "State"
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
  listener.init(subscribeOnGet(listener))
}

export abstract class StatePublisher<T> {
  private listeners: Map<StateListener, StateListenerVersion> = new Map()
  private runnables: Array<StateListener> | undefined

  abstract getValue(): T

  addListener(listener: StateListener) {
    this.listeners.set(listener, listener.version!)
  }

  removeListener(listener: StateListener) {
    this.listeners.delete(listener)
  }

  notifyListeners() {
    this.runnables = []
    const effects: Array<[StateListener, StateListenerVersion]> = []

    for (const entry of this.listeners) {
      if (entry[0] instanceof StatePublisher) {
        this.checkRunnable(...entry)
      } else {
        effects.push(entry)
      }
    }

    for (const [listener, version] of effects) {
      this.checkRunnable(listener, version)
    }
  }

  private checkRunnable(listener: StateListener, version: StateListenerVersion) {
    if (version === listener.version || listener.overrideVersionTracking) {
      listener.parent = this
      listener.notifyListeners?.()
      this.runnables!.push(listener)
    } else {
      this.removeListener(listener)
    }
  }

  runListeners() {
    for (const listener of this.runnables ?? []) {
      if (listener.parent === this) {
        listener.version = listener.version! + 1
        listener.run(subscribeOnGet(listener))
        listener.parent = undefined
      }
    }

    this.runnables = undefined
  }
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

export interface CommandController<T> {
  run(message: T): void
}

export type Token = State<any> | Command<any>

export interface TokenRegistry {
  getState<C extends StatePublisher<any>>(token: State<any>): C
  setState(state: State<any>, publisher: StatePublisher<any>): void
  getCommand(token: Command<any>): CommandController<any>
  setCommand(token: Command<any>, controller: CommandController<any>): void
  registerState<T>(token: State<T>, initialState?: T): StatePublisher<T>
  registerCommand<T>(token: Command<T>): CommandController<T>
}

export class OverlayTokenRegistry implements TokenRegistry {
  constructor(protected parentRegistry: TokenRegistry) { }

  getState<C extends StatePublisher<any>>(token: State<any>): C {
    return this.parentRegistry.getState(token)
  }

  setState(state: State<any>, publisher: StatePublisher<any>): void {
    return this.parentRegistry.setState(state, publisher)
  }

  getCommand(token: Command<any>): CommandController<any> {
    return this.parentRegistry.getCommand(token)
  }

  setCommand(token: Command<any>, controller: CommandController<any>): void {
    return this.parentRegistry.setCommand(token, controller)
  }

  registerState<T>(token: State<T>, initialState?: T): StatePublisher<T> {
    return this.parentRegistry.registerState(token, initialState)
  }

  registerCommand<T>(token: Command<T>): CommandController<T> {
    return this.parentRegistry.registerCommand(token)
  }
}