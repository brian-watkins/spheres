import { SimpleStateController, StateController, StateListener } from "./controller.js"
import { Meta, error, ok, pending } from "./meta.js"

export type GetState = <S, N = S>(state: State<S, N>) => S

export interface ReadyHookActions<T, M, E> {
  get: GetState
  supply(value: T): void
  pending(value: M): void
  error(value: M, reason: E): void
  current: T
}

export interface WriteHookActions<T, M, E> {
  get: GetState
  ok(value: M): void
  pending(value: M): void
  error(value: M, reason: E): void
  current: T
}

export interface PublishHookActions {
  get: GetState
}

export interface ContainerHooks<T, M, E = unknown> {
  onReady?(actions: ReadyHookActions<T, M, E>): void
  onWrite?(message: M, actions: WriteHookActions<T, M, E>): void
  onPublish?(value: T, actions: PublishHookActions): void
}

export interface WriteMessage<T, M = T> {
  type: "write"
  container: Container<T, M>
  value: M
}

export interface UpdateMessage<T, M = T> {
  type: "update"
  container: Container<T, M>
  generator: (current: T) => M
}

export interface ExecMessage<M> {
  type: "exec"
  command: Command<M>
  message: M
}

export interface ResetMessage<T, M = T> {
  type: "reset"
  container: Container<T, M>
}

export interface RunMessage {
  type: "run"
  effect: () => void
}

export interface Rule<Argument = undefined> {
  readonly definition: (get: GetState, input: Argument) => StoreMessage<any>
}

export interface UseMessage {
  type: "use"
  rule: Rule<any>
  input: any
}

export interface BatchMessage {
  type: "batch"
  messages: Array<StoreMessage<any>>
}

export type StoreMessage<T, M = T> = WriteMessage<T, M> | UpdateMessage<T, M> | ResetMessage<T, M> | UseMessage | BatchMessage | RunMessage | ExecMessage<M>

const registerState = Symbol("registerState")
const initializeCommand = Symbol("initializeCommand")
const getController = Symbol("getController")
const initialValue = Symbol("initialValue")

type StoreRegistryKey = State<any>

export abstract class State<T, M = T> {
  constructor(readonly id: string | undefined, readonly name: string | undefined) { }

  abstract [registerState](store: Store): StateController<T, M>

  toString() {
    return this.name && this.id ? `${this.name}-${this.id}` : (this.name ?? this.id ?? "State")
  }
}

export class MetaState<T, M, E = unknown> extends State<Meta<M, E>> {
  constructor(private token: State<T, M>) {
    super(token.id ? `meta[${token.id}]` : undefined, `meta[${token.toString()}]`)
  }

  [registerState](store: Store): StateController<Meta<M, E>> {
    const tokenController = store[getController](this.token)

    const controller = new SimpleStateController<Meta<M, E>>(ok())

    tokenController.addListener({
      update: () => {
        controller.write(ok())
      }
    })

    return controller
  }
}

abstract class AbstractReactiveQuery implements StateListener {
  constructor(protected store: Store) { }

  protected getValue<S, N>(state: State<S, N>): S {
    const controller = this.store[getController](state)
    controller.addListener(this)
    return controller.value
  }

  abstract update(): void
}

export class SuppliedState<T, M = any, E = any> extends State<T, M> {
  private _meta: MetaState<T, M, E> | undefined

  constructor(id: string | undefined, name: string | undefined, private initialValue: T) {
    super(id, name)
  }

  [registerState](_: Store): StateController<T, M> {
    return new SimpleStateController(this.initialValue)
  }

  get meta(): MetaState<T, M, E> {
    if (this._meta === undefined) {
      this._meta = new MetaState(this)
    }
    return this._meta
  }
}

export class Container<T, M = T, E = any> extends State<T, M> {
  private _meta: MetaState<T, M, E> | undefined

  constructor(
    id: string | undefined,
    name: string | undefined,
    private initialValue: T,
    private update: ((message: M, current: T) => UpdateResult<T>) | undefined,
  ) {
    super(id, name)
  }

  get [initialValue](): T {
    return this.initialValue
  }

  [registerState](store: Store): StateController<T, M> {
    return this.update ?
      new MessagePassingStateController(store, this.initialValue, this.update) :
      new SimpleStateController(this.initialValue)
  }

  get meta(): MetaState<T, M, E> {
    if (this._meta === undefined) {
      this._meta = new MetaState(this)
    }
    return this._meta
  }
}

export class DerivedState<T> extends State<T> {
  constructor(id: string | undefined, name: string | undefined, private derivation: (get: GetState, current: T | undefined) => T) {
    super(id, name)
  }

  [registerState](store: Store): StateController<T, T> {
    const reactiveQuery = new ReactiveValue(store, this, this.derivation)
    const initialValue = reactiveQuery.run(undefined)

    return new SimpleStateController(initialValue)
  }
}

class ReactiveValue<T, M> extends AbstractReactiveQuery {
  constructor(store: Store, private state: DerivedState<any>, private definition: (get: GetState, current: T | undefined) => M) {
    super(store)
  }

  update(): void {
    const derivedController = this.store[getController](this.state)
    derivedController.accept(this.run(derivedController.value))
  }

  run(currentValue: T | undefined): M {
    return this.definition((state) => this.getValue(state), currentValue)
  }
}

const initForStore = Symbol()
const runQuery = Symbol()

const queriesToUpdate = new Set<ReactiveQuery>()

function queueQueryForUpdate(query: ReactiveQuery) {
  if (queriesToUpdate.size === 0) {
    queueMicrotask(() => {
      for (const query of queriesToUpdate) {
        query[runQuery]()
      }
      queriesToUpdate.clear()
    })
  }
  queriesToUpdate.add(query)
}

export abstract class ReactiveQuery implements StateListener {
  private deps = new Set<StateController<any>>()
  protected store!: Store

  [initForStore](store: Store) {
    this.store = store

    if (this.init !== undefined) {
      this.init((state) => {
        return this.getValue(state)
      })
    } else {
      this.run((state) => {
        return this.getValue(state)
      })
    }
  }

  init?(get: GetState): void

  abstract run(get: GetState): void

  private getValue<S, N>(state: State<S, N>): S {
    const controller = this.store[getController](state)
    controller.addListener(this)
    this.deps.add(controller)
    return controller.value
  }

  [runQuery](): void {
    this.unsubscribe()
    this.run((state) => {
      return this.getValue(state)
    })
  }

  update(): void {
    queueQueryForUpdate(this)
  }

  unsubscribe() {
    for (const controller of this.deps) {
      controller.removeListener(this)
    }
    this.deps.clear()
  }
}

class DispatchCommandQuery<M> extends ReactiveQuery {
  constructor(private command: Command<M>, private trigger: (get: GetState) => M) {
    super()
  }

  run(get: GetState): void {
    this.store.dispatch({
      type: "exec",
      command: this.command,
      message: this.trigger!((state) => get(state))
    })
  }
}

export class Command<M> {
  constructor(private trigger: ((get: GetState) => M) | undefined) { }

  [initializeCommand](store: Store): void {
    if (this.trigger !== undefined) {
      store.useQuery(new DispatchCommandQuery(this, this.trigger))
    }
  }
}

export interface CommandActions {
  get<T, M>(state: State<T, M>): T
  supply<T, M, E>(state: SuppliedState<T, M, E>, value: T): void
  pending<T, M, E>(state: SuppliedState<T, M, E>, message: M): void
  error<T, M, E>(state: SuppliedState<T, M, E>, message: M, reason: E): void
}

export interface CommandManager<M> {
  exec(message: M, actions: CommandActions): void
}

export interface StoreHooks {
  onRegister(container: Container<any>): void
}

export class Store {
  private registry: WeakMap<StoreRegistryKey, StateController<any, any>> = new WeakMap();
  private commandRegistry: Map<Command<any>, CommandManager<any>> = new Map()
  private hooks: StoreHooks | undefined
  private tokenIdMap: Map<string, StoreRegistryKey> = new Map();

  private getKeyForToken(token: State<any>): StoreRegistryKey {
    if (token.id === undefined) return token

    const key = this.tokenIdMap.get(token.id)
    if (key === undefined) {
      this.tokenIdMap.set(token.id, token)
      return token
    }
    return key
  }

  [getController]<T, M>(token: State<T, M>): StateController<T, M> {
    const key = this.getKeyForToken(token)
    let controller = this.registry.get(key)
    if (controller === undefined) {
      controller = token[registerState](this)
      this.registry.set(key, controller)
      if (this.hooks !== undefined && token instanceof Container) {
        this.hooks.onRegister(token)
      }
    }
    return controller
  }

  useHooks(hooks: StoreHooks) {
    this.hooks = hooks
  }

  useQuery(query: ReactiveQuery): void {
    query[initForStore](this)
  }

  useCommand<M>(command: Command<M>, handler: CommandManager<M>) {
    this.commandRegistry.set(command, handler)
    command[initializeCommand](this)
  }

  private containerReadyActions<T, M, E>(container: Container<T, M>, controller: StateController<T, M>): ReadyHookActions<T, M, E> {
    return {
      get: (state) => {
        return this[getController](state).value
      },
      supply: (value) => {
        controller.publish(value)
      },
      pending: (message) => {
        this[getController](container.meta).publish(pending(message))
      },
      error: (message, reason) => {
        this[getController](container.meta).publish(error(message, reason))
      },
      current: controller.value
    }
  }

  private containerWriteActions<T, M, E>(container: Container<T, M>, controller: StateController<T, M>): WriteHookActions<T, M, E> {
    return {
      get: (state) => {
        return this[getController](state).value
      },
      ok: (message) => {
        controller.accept(message)
      },
      pending: (message) => {
        this[getController](container.meta).write(pending(message))
      },
      error: (message, reason) => {
        this[getController](container.meta).write(error(message, reason))
      },
      current: controller.value
    }
  }

  useContainerHooks<T, M, E>(container: Container<T, M>, hooks: ContainerHooks<T, M, E>) {
    const controllerWithHooks = this.stateControllerWithHooks(container, this[getController](container), hooks)
    this.registry.set(this.getKeyForToken(container), controllerWithHooks)

    if (hooks.onReady !== undefined) {
      hooks.onReady(this.containerReadyActions(container, controllerWithHooks))
    }
  }

  private stateControllerWithHooks<T, M, E>(container: Container<T, M, E>, controller: StateController<T, M>, hooks: ContainerHooks<T, M, E>): StateController<T, M> {
    let withHooks: StateController<T, M> = controller
    if (hooks.onPublish) {
      withHooks = new Proxy(withHooks, {
        get: (target, prop, receiver) => {
          if (prop === "accept") {
            return (message: any) => {
              target.publish(message)
              hooks.onPublish!(target.value, {
                get: (state) => {
                  return this[getController](state).value
                }
              })
            }
          }
          return Reflect.get(target, prop, receiver)
        }
      })
    }
    if (hooks.onWrite) {
      withHooks = new Proxy(withHooks, {
        get: (target, prop, receiver) => {
          if (prop === "accept") {
            return (message: any) => {
              hooks.onWrite!(message, this.containerWriteActions(container, target))
            }
          }
          return Reflect.get(target, prop, receiver)
        }
      })
    }
    return withHooks
  }

  dispatch(message: StoreMessage<any>) {
    switch (message.type) {
      case "write":
        this[getController](message.container).write(message.value)
        break
      case "update":
        const controller = this[getController](message.container)
        controller.write(message.generator(controller.value))
        break
      case "exec":
        this.commandRegistry.get(message.command)?.exec(message.message, {
          get: (state) => {
            return this[getController](state).value
          },
          supply: (token, value) => {
            this[getController](token).publish(value)
          },
          pending: (token, message) => {
            this[getController](token.meta).write(pending(message))
          },
          error: (token, message, reason) => {
            this[getController](token.meta).write(error(message, reason))
          }
        })
        break
      case "reset":
        this.dispatch({
          type: "write",
          container: message.container,
          value: message.container[initialValue]
        })
        break
      case "use":
        const get: GetState = (state) => this[getController](state).value
        const result = message.rule.definition(get, message.input)
        this.dispatch(result)
        break
      case "run":
        message.effect()
        break
      case "batch":
        for (let i = 0; i < message.messages.length; i++) {
          this.dispatch(message.messages[i])
        }
        break
    }
  }
}


export interface UpdateResult<T> {
  value: T
  message?: StoreMessage<any>
}

export class MessagePassingStateController<T, M> extends SimpleStateController<T> implements StateController<T, M> { 
  constructor(private store: Store, initialValue: T, private update: ((message: M, current: T) => UpdateResult<T>)) {
    super(initialValue)
  }

  accept(message: M): void {
    const result = this.update(message, this.value)
    this.publish(result.value)
    if (result.message !== undefined) {
      this.store.dispatch(result.message)
    }
  }
}