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

function subscribeOnGet(this: Subscriber, token: StateReference<any>): any {
  const publisher = getStatePublisher(this[0], token)
  publisher.addListener(this)
  return publisher.getValue()
}

export function getStateFunctionWithListener(key: Subscriber): GetState {
  return subscribeOnGet.bind(key) as GetState
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
  notifyListeners?: (userEffects: Array<Subscriber>) => void
  init(get: GetState, context?: any): void
  run(get: GetState, context?: any): void
}

export function initListener(registry: TokenRegistry, listener: StateListener, context?: any): Subscriber {
  const subscriber = createSubscriber(registry, listener, context)
  listener.init(getStateFunctionWithListener(subscriber), context)
  return subscriber
}

function runListener(key: Subscriber) {
  setVersion(key, getVersion(key) + 1)
  key[1].run(getStateFunctionWithListener(key), key[4])
  setParent(key, undefined)
}

export type Subscriber = [
  registry: TokenRegistry,
  listener: StateListener,
  version: StateListenerVersion,
  parent: any,
  context: any
]

interface ListenerNode {
  subscriber: Subscriber
  version: StateListenerVersion
  next: ListenerNode | undefined
}

export abstract class StatePublisher<T> {
  head: ListenerNode | undefined
  tail: ListenerNode | undefined

  abstract getValue(): T

  addListener(subscriber: Subscriber): void {
    if (this.head === undefined) {
      this.head = {
        subscriber: subscriber,
        version: getVersion(subscriber),
        next: undefined
      }
      this.tail = this.head
      return
    }
    if (subscriber[1].type === StateListenerType.StateEffect) {
      const first = {
        subscriber,
        version: getVersion(subscriber),
        next: this.head
      }
      this.head = first
    } else {
      const next = {
        subscriber,
        version: getVersion(subscriber),
        next: undefined
      }
      this.tail!.next = next
      this.tail = next
    }
  }

  private removeFromList(previous: ListenerNode | undefined, node: ListenerNode) {
    if (previous === undefined) {
      this.head = node.next
      if (this.tail === node) {
        this.tail = this.head
      }
    } else {
      previous.next = node.next
      if (this.tail === node) {
        this.tail = previous
      }
    }
  }

  notifyListeners(userEffects: Array<Subscriber>): void {
    let previous: ListenerNode | undefined = undefined
    let node = this.head
    while (node !== undefined) {
      if (getVersion(node.subscriber) !== node.version) {
        this.removeFromList(previous, node)
        node = node.next
        continue
      }
      const listener = getListener(node.subscriber)
      switch (listener.type) {
        case StateListenerType.StateEffect:
          listener.notifyListeners?.(userEffects)
          break
        case StateListenerType.UserEffect:
          userEffects.push(node.subscriber)
          break
      }
      setParent(node.subscriber, this)

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
      if (getParent(node.subscriber) !== this) {
        node = node.next
        continue
      }

      if (getListener(node.subscriber).type === StateListenerType.UserEffect) {
        setParent(node.subscriber, true)
        node = node.next
        continue
      }

      runListener(node.subscriber)
      node = node.next
    }
  }

  runUserEffects(subscribers: Array<Subscriber>) {
    for (const subscriber of subscribers) {
      if (getParent(subscriber) === true) {
        runListener(subscriber)
      }
    }
  }
}

export function createSubscriber(registry: TokenRegistry, listener: StateListener, context?: any): Subscriber {
  return [registry, listener, 0, undefined, context]
}

function getParent(key: Subscriber): any {
  return key[3]
}

function setParent(key: Subscriber, parent: any): void {
  key[3] = parent
}

function getVersion(key: Subscriber): StateListenerVersion {
  return key[2]
}

export function setVersion(key: Subscriber, version: StateListenerVersion): void {
  key[2] = version
}

function getListener(key: Subscriber): StateListener {
  return key[1]
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