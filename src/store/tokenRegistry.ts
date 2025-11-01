export const getPublisher = Symbol("getPublisher")

export interface StateReference<Value> {
  [getPublisher](registry: TokenRegistry): StatePublisher<Value>
}

export type GetState = <S>(state: StateReference<S>) => S

export type Stateful<T> = (get: GetState) => T | undefined

function subscribeOnGet(this: Subscriber, token: StateReference<any>): any {
  // console.log("subscribing token", token)
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
  constructor(private __name: string | undefined) { }

  abstract [createPublisher](registry: TokenRegistry, initialState?: T): StatePublisher<T>

  [getPublisher]<X extends StatePublisher<T>>(registry: TokenRegistry): X {
    return registry.getState(this)
  }

  toString() {
    return this.__name ?? "State"
  }
}

export type StateListenerVersion = number

export enum StateListenerType {
  StateEffect, SystemEffect, UserEffect
}

export interface StateListener {
  readonly type: StateListenerType
  notifyListeners?: (userEffects: Array<ListenerNode>) => void
  init(get: GetState, context?: any): void
  run(get: GetState, context?: any): void
}

export function initListener(registry: TokenRegistry, listener: StateListener, context?: any): void {
  const subscriber = createSubscriber(registry, listener, context)
  listener.init(getStateFunctionWithListener(subscriber), context)
}

export interface Subscriber {
  registry: TokenRegistry,
  listener: StateListener,
  version: StateListenerVersion,
  parent: any,
  context: any
  handleEvent(evt: Event): void
}

export interface ListenerNode {
  subscriber: Subscriber
  version: StateListenerVersion
  next: ListenerNode | undefined
}

export type StateTag = string | number

export interface StatePublisher<T> {
  getValue(): T
  addListener(subscriber: Subscriber): void
  removeListener(listener: StateListener): void
  notifyListeners(userEffects: Array<ListenerNode>): void
  runListeners(): void
  runUserEffects(subscribers: Array<ListenerNode>): void
}

export abstract class ImmutableStatePublisher<T> implements StatePublisher<T> {
  private head: ListenerNode | undefined
  private tail: ListenerNode | undefined
  public filter: string | undefined

  abstract getValue(): T

  addListener(subscriber: Subscriber): void {
    if (this.head === undefined) {
      this.head = {
        subscriber: subscriber,
        version: subscriber.version,
        next: undefined
      }
      this.tail = this.head
      return
    }
    if (subscriber.listener.type === StateListenerType.StateEffect) {
      const first = {
        subscriber,
        version: subscriber.version,
        next: this.head
      }
      this.head = first
    } else {
      const next = {
        subscriber,
        version: subscriber.version,
        next: undefined
      }
      this.tail!.next = next
      this.tail = next
    }
  }

  removeListener(listener: StateListener) {
    let node = this.head
    let previous = undefined
    while (node !== undefined) {
      if (node.subscriber.listener === listener) {
        this.removeFromList(previous, node)
      }
      previous = node
      node = node.next
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

  notifyListeners(userEffects: Array<ListenerNode>): void {
    let previous: ListenerNode | undefined = undefined
    let node = this.head
    while (node !== undefined) {
      if (node.subscriber.version !== node.version) {
        this.removeFromList(previous, node)
        node = node.next
        continue
      }
      const listener = node.subscriber.listener
      switch (listener.type) {
        case StateListenerType.StateEffect:
          listener.notifyListeners?.(userEffects)
          break
        case StateListenerType.UserEffect:
          userEffects.push(node)
          break
      }
      node.subscriber.parent = this

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
      if (node.subscriber.parent !== this) {
        node = node.next
        continue
      }

      if (node.subscriber.listener.type === StateListenerType.UserEffect) {
        node.subscriber.parent = true
        node = node.next
        continue
      }

      this.runListener(node)
      node = node.next
    }
  }

  runUserEffects(nodes: Array<ListenerNode>) {
    for (const node of nodes) {
      if (node.subscriber.parent === true) {
        this.runListener(node)
      }
    }
  }

  protected runListener(node: ListenerNode) {
    const key = node.subscriber
    key.version = key.version + 1
    key.listener.run(getStateFunctionWithListener(key), key.context)
    key.parent = undefined
  }
}

export function runListener(key: Subscriber) {
  key.version = key.version + 1
  key.listener.run(getStateFunctionWithListener(key), key.context)
  key.parent = undefined
}

export function runUserEffects(nodes: Array<ListenerNode>) {
  for (const node of nodes) {
    if (node.subscriber.parent === true) {
      runListener(node.subscriber)
    }
  }
}

export function createSubscriber(registry: TokenRegistry, listener: StateListener, context?: any): Subscriber {
  return {
    registry,
    listener,
    version: 0,
    parent: undefined,
    context,
    handleEvent(evt) {
      console.log("SPHERES EVENT", evt.type)
      if (evt.type.startsWith("spheres-notify")) {
        console.log("SUBSCRIBER NOTIFY EVENT HANDLER")
        this.parent = evt.target
        if (listener.type === StateListenerType.StateEffect) {
          //@ts-ignore
          listener.notifyListeners?.(evt.detail)
        }
      } else {
        console.log("SUBSCRIBER PUBLISH EVENT HANDLER")
        if (this.parent === evt.target) {
          console.log("SUBSCRIBER RUNNING LISTENER")
          runListener(this)
        }
      }
    },
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
  filter: string | number | undefined
  onRegister(handler: (token: Token) => void): void
  getState<C extends StatePublisher<any>>(token: State<any>): C
  setState(state: State<any>, publisher: StatePublisher<any>): void
  getCommand(token: Command<any>): CommandController<any>
  setCommand(token: Command<any>, controller: CommandController<any>): void
}

export class OverlayTokenRegistry implements TokenRegistry {
  filter: string | number | undefined

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