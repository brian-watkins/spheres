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

export enum StateListenerType {
  StateEffect, SystemEffect, UserEffect
}

export interface StateListener {
  readonly type: StateListenerType
  registry: TokenRegistry
  parent?: StatePublisher<any> | boolean
  version?: StateListenerVersion
  notifyListeners?: (userEffects: Array<StateListener>) => void
  init(get: GetState): void
  run(get: GetState): void
}

export function initListener(listener: StateListener) {
  listener.version = 0
  listener.init(subscribeOnGet(listener))
}

function runListener(listener: StateListener) {
  listener.version = listener.version! + 1
  listener.run(subscribeOnGet(listener))
  listener.parent = undefined
}

interface ListenerNode {
  listener: StateListener
  version: StateListenerVersion
  next: ListenerNode | undefined
}

export abstract class StatePublisher<T> {
  head: ListenerNode | undefined
  tail: ListenerNode | undefined

  abstract getValue(): T

  addListener(listener: StateListener): void {
    if (this.head === undefined) {
      this.head = {
        listener: listener,
        version: listener.version!,
        next: undefined
      }
      this.tail = this.head
      return
    }
    if (listener.type === StateListenerType.StateEffect) {
      const first = {
        listener: listener,
        version: listener.version!,
        next: this.head
      }
      this.head = first
    } else {
      const next = {
        listener: listener,
        version: listener.version!,
        next: undefined
      }
      this.tail!.next = next
      this.tail = next
    }
  }

  private removeFromList(previous: ListenerNode | undefined, node: ListenerNode) {
    if (previous === undefined) {
      this.head = node.next
    } else {
      previous.next = node.next
      if (this.tail === node) {
        this.tail = previous
      }
    }
  }

  notifyListeners(userEffects: Array<StateListener>): void {
    let previous: ListenerNode | undefined = undefined
    let node = this.head
    while (node !== undefined) {
      if (node.listener.version !== node.version) {
        this.removeFromList(previous, node)
        node = node.next
        continue
      }
      switch (node.listener.type) {
        case StateListenerType.StateEffect:
          node.listener.notifyListeners?.(userEffects)
          break
        case StateListenerType.UserEffect:
          userEffects.push(node.listener)
          break
      }
      node.listener.parent = this

      previous = node
      node = node.next
    }
  }

  runListeners(): void {
    let node = this.head

    // Start a new list -- any listeners added while running the current listeners
    // will be added to the new list
    this.head = undefined
    this.tail = undefined

    while (node !== undefined) {
      if (node.listener.parent !== this) {
        node = node.next
        continue
      }

      if (node.listener.type === StateListenerType.UserEffect) {
        node.listener.parent = true
        node = node.next
        continue
      }

      runListener(node.listener)
      node = node.next
    }
  }

  runUserEffects(effects: Array<StateListener>) {
    for (const listener of effects) {
      if (listener.parent === true) {
        runListener(listener)
      }
    }
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