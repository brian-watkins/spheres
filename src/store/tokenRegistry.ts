export const getPublisher = Symbol("getPublisher")

export interface StateReference<Value> {
  [getPublisher](registry: TokenRegistry): StatePublisher<Value>
}

export type GetState = <S>(state: StateReference<S>) => S

export type Stateful<T> = (get: GetState) => T | undefined

function subscribeOnGet(this: Subscriber, token: StateReference<any>): any {
  // console.log("subscribing token", token)
  const publisher = token[getPublisher](this[0])
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
    console.log("get pub in state", this)
    return registry.getState(this)
  }

  toString() {
    return this.__name ?? "State"
  }
}

// export class Flux<T> extends State<T> {
//   constructor(private publisher: StatePublisher<T>) {
//     super(undefined)
//   }

//   [createPublisher](): StatePublisher<T> {
//     return this.publisher
//   }

// }

export type StateListenerVersion = number

export enum StateListenerType {
  // SystemEffect could be RenderEffect
  // Or InternalEffect?
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

export type Subscriber = [
  registry: TokenRegistry,
  listener: StateListener,
  version: StateListenerVersion,
  parent: any,
  context: any
]

export interface ListenerNode {
  subscriber: Subscriber
  tags: Array<StateTag> | undefined
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

  addListener(subscriber: Subscriber, tags?: Array<StateTag>): void {
    // console.log("Subscribing with tag", tag)
    if (this.head === undefined) {
      this.head = {
        subscriber: subscriber,
        tags,
        version: getVersion(subscriber),
        next: undefined
      }
      this.tail = this.head
      return
    }
    if (subscriber[1].type === StateListenerType.StateEffect) {
      const first = {
        subscriber,
        tags,
        version: getVersion(subscriber),
        next: this.head
      }
      this.head = first
    } else {
      const next = {
        subscriber,
        tags,
        version: getVersion(subscriber),
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
      if (getListener(node.subscriber) === listener) {
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
      if (getVersion(node.subscriber) !== node.version) {
        // console.log("Removing subscriber with tag", node.tag)
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
          userEffects.push(node)
          break
      }
      setParent(node.subscriber, this)

      previous = node
      node = node.next
    }
  }

  runListeners(tags?: Array<StateTag>): void {
    console.log("A tags", tags)
    let node = this.head

    // Start a new list -- any listeners added while running the current listeners
    // will be added to the new list
    this.head = undefined
    this.tail = undefined

    while (node !== undefined) {
      // console.log("Attempting to run node", node.tag)
      // if (filter !== undefined && !filter.startsWith(node.tag ?? "undefined")) {
      // const subscriberTag = `$.${node.subscriber[0].filter}.${node.tag}`
      // const subscriberTag = node.tag
      // if (filter !== subscriberTag) {
      //   // when this happens
      //   console.log("skipping node because tag does not equal filter", filter, subscriberTag)
      //   this.addListener(node.subscriber)
      //   node = node.next
      //   continue
      // } else {
      //   console.log("Running node with filter", node.tag)
      // }

      if (getParent(node.subscriber) !== this) {
        console.log("B")
        node = node.next
        continue
      }

      if (getListener(node.subscriber).type === StateListenerType.UserEffect) {
        console.log("C")
        setParent(node.subscriber, true)
        node = node.next
        continue
      }

      console.log("Calling run listener with tags", tags)
      // don't we have enough info to check for changes here?
      this.runListener(node, tags)
      node = node.next
    }
  }

  runUserEffects(nodes: Array<ListenerNode>, tags?: Array<StateTag>) {
    for (const node of nodes) {
      if (getParent(node.subscriber) === true) {
        this.runListener(node, tags)
      }
    }
  }

  protected runListener(node: ListenerNode, tags?: Array<StateTag>) {
    const key = node.subscriber
    setVersion(key, getVersion(key) + 1)
    key[1].run(getStateFunctionWithListener(key), key[4])
    setParent(key, undefined)
  }
}

export function runListener(key: Subscriber) {
  setVersion(key, getVersion(key) + 1)
  key[1].run(getStateFunctionWithListener(key), key[4])
  setParent(key, undefined)
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

function setVersion(key: Subscriber, version: StateListenerVersion): void {
  key[2] = version
}

function getListener(key: Subscriber): StateListener {
  return key[1]
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