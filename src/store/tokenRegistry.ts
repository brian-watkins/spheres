
export interface IndexableState<K, V> extends State<V> {
  [createPublisher](registry: TokenRegistry): IndexableStatePublisher<K, V>
}

export type IndexableStateReference<K, X extends IndexableState<K, any>> = [token: X, key: K]

function isIndexableStateReference(state: StateReference<any>): state is IndexableStateReference<any, any> {
  return Array.isArray(state)
}

export type StateReference<X extends State<any>> = X extends IndexableState<infer K, any> ? IndexableStateReference<K, X> : X

export type GetState = <X extends State<any>>(
  state: StateReference<X>
) => X extends State<infer S> ? S : never

export type Stateful<T> = (get: GetState) => T | undefined

function subscribeOnGet(this: StateListener, token: StateReference<any>): any {
  const publisher = getStatePublisher(this.registry, token)
  publisher.addListener(this)
  return publisher.getValue()
}

export function getStateFunctionWithListener(listener: StateListener): GetState {
  return subscribeOnGet.bind(listener) as GetState
}

export function runQuery<M>(registry: TokenRegistry, query: (get: GetState) => M): M {
  return query((token) => getStatePublisher(registry, token).getValue())
}

export function getStatePublisher<C extends StatePublisher<any>>(registry: TokenRegistry, token: StateReference<any>): C {
  if (isIndexableStateReference(token)) {
    return registry.getState<IndexableStatePublisher<any, any>>(token[0])
      .indexedBy<C>(token[1])
  } else {
    return registry.getState<C>(token)
  }
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
  listener.init(getStateFunctionWithListener(listener))
}

function runListener(listener: StateListener) {
  listener.version = listener.version! + 1
  listener.run(getStateFunctionWithListener(listener))
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

export interface IndexableStatePublisher<Key, Value> extends StatePublisher<Value> {
  indexedBy<C extends StatePublisher<Value>>(key: Key): C
  clear(): void
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

export class OverlayTokenRegistry implements TokenRegistry {
  constructor(protected parentRegistry: TokenRegistry) { }

  onRegister(): void { }

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
}