import { StateController, MessageStatus, StateListener } from "./controller.js"
import { Meta, error, ok, pending } from "./meta.js"

export type GetState = <S, N = S>(state: State<S, N>) => S
export type Stateful<T> = (get: GetState) => T | undefined

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

export interface Effect {
  run(get: GetState): void
}

export interface ConstraintActions<T> {
  get: GetState,
  current: T
}

export interface WriteMessage<T, M = T> {
  type: "write"
  container: Container<T, M>
  value: M
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

export type StoreMessage<T, M = T> = WriteMessage<T, M> | ResetMessage<T, M> | UseMessage | BatchMessage | RunMessage | ExecMessage<M>

const registerState = Symbol("registerState")
const initializeCommand = Symbol("initializeCommand")
const getController = Symbol("getController")
const initialValue = Symbol("initialValue")
const getKeyForToken = Symbol("getKeyForToken")

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

    const controller = new StateController<Meta<M, E>>(ok(), (val) => val)

    tokenController.setMeta(controller)

    return controller
  }
}

abstract class AbstractReactiveQuery implements StateListener {
  private dependencies: WeakSet<StateController<any, any>> = new WeakSet()

  constructor(protected store: Store) { }

  protected getValue<S, N>(state: State<S, N>): S {
    const controller = this.store[getController](state)
    if (!this.dependencies.has(controller)) {
      this.dependencies.add(controller)
      controller.addListener(this)
    }
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
    return new StateController(this.initialValue, undefined)
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
    private reducer: ((message: M, current: T) => T) | undefined,
    private query: ((actions: ConstraintActions<T>, nextValue?: M) => M) | undefined
  ) {
    super(id, name)
  }

  get [initialValue](): T {
    return this.initialValue
  }

  [registerState](store: Store): StateController<T, M> {
    const controller = new StateController(this.initialValue, this.reducer)

    if (this.query === undefined) {
      return controller
    }

    const reactiveQuery = new ReactiveContainerQuery(store, this, this.query)

    controller.setQuery((current, next) => {
      return reactiveQuery.run(current, next)
    })

    controller.update(MessageStatus.Constrained, reactiveQuery.run(this.initialValue, undefined))

    return controller
  }

  get meta(): MetaState<T, M, E> {
    if (this._meta === undefined) {
      this._meta = new MetaState(this)
    }
    return this._meta
  }
}

class ReactiveContainerQuery<T, M> extends AbstractReactiveQuery {
  constructor(store: Store, private state: Container<T, M>, private query: ((actions: ConstraintActions<T>, nextValue?: M) => M)) {
    super(store)
  }

  update(): void {
    const containerController = this.store[getController](this.state)
    containerController.update(MessageStatus.Constrained, this.run(containerController.value, undefined))
  }

  run(currentValue: T, nextValue: M | undefined): M {
    return this.query({ get: (state) => this.getValue(state), current: currentValue }, nextValue)
  }
}

export class DerivedState<T> extends State<T> {
  constructor(id: string | undefined, name: string | undefined, private derivation: (get: GetState, current: T | undefined) => T) {
    super(id, name)
  }

  [registerState](store: Store): StateController<T, T> {
    const reactiveQuery = new ReactiveValue(store, this, this.derivation)
    const initialValue = reactiveQuery.run(undefined)

    return new StateController(initialValue, undefined)
  }
}

class ReactiveValue<T, M> extends AbstractReactiveQuery {
  constructor(store: Store, private state: DerivedState<any>, private definition: (get: GetState, current: T | undefined) => M) {
    super(store)
  }

  update(): void {
    const derivedController = this.store[getController](this.state)
    derivedController.update(MessageStatus.Written, this.run(derivedController.value))
  }

  run(currentValue: T | undefined): M {
    return this.definition((state) => this.getValue(state), currentValue)
  }
}

export interface EffectHandle {
  unsubscribe(): void
}

class ReactiveEffect extends AbstractReactiveQuery implements EffectHandle {
  constructor(store: Store, private effect: Effect) {
    super(store)
  }

  update() {
    this.effect.run((state) => this.getValue(state))
  }

  unsubscribe() {
    this.effect = {
      run: () => {
        // do nothing
      }
    }
  }
}

export class Command<M> {
  constructor(private query: ((get: GetState) => M) | undefined) { }

  [initializeCommand](store: Store): void {
    if (this.query !== undefined) {
      const reactiveQuery = new ReactiveCommandQuery(store, this, this.query)
      reactiveQuery.update()
    }
  }
}

class ReactiveCommandQuery<M> extends AbstractReactiveQuery {
  constructor(store: Store, private command: Command<M>, private query: (get: GetState) => M) {
    super(store)
  }

  update(): void {
    this.store.dispatch({
      type: "exec",
      command: this.command,
      message: this.run()
    })
  }

  run(): M {
    return this.query((state) => this.getValue(state))
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

  [getKeyForToken](token: State<any>): StoreRegistryKey {
    if (token.id === undefined) return token

    const key = this.tokenIdMap.get(token.id)
    if (key === undefined) {
      this.tokenIdMap.set(token.id, token)
      return token
    }
    return key
  }

  [getController]<T, M>(token: State<T, M>): StateController<T, M> {
    const key = this[getKeyForToken](token)
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

  useEffect(effect: Effect): EffectHandle {
    const reactiveEffect = new ReactiveEffect(this, effect)
    reactiveEffect.update()
    return reactiveEffect
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
        controller.update(MessageStatus.Written, message)
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

  useContainerHooks<T, M, E>(container: Container<T, M>, hooks: ContainerHooks<T, M, E>) {
    const controller = this[getController](container)

    if (hooks.onWrite !== undefined) {
      controller.setWriter((message) => {
        hooks.onWrite!(message, this.containerWriteActions(container, controller))
      })
    }

    if (hooks.onReady !== undefined) {
      hooks.onReady(this.containerReadyActions(container, controller))
    }

    if (hooks.onPublish !== undefined) {
      controller.setPublishHook(() => {
        hooks.onPublish!(controller.value, {
          get: (state) => {
            return this[getController](state).value
          }
        })
      })
    }
  }

  dispatch(message: StoreMessage<any>) {
    switch (message.type) {
      case "write":
        this[getController](message.container).update(MessageStatus.Provided, message.value)
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
            this[getController](token.meta).publish(pending(message))
          },
          error: (token, message, reason) => {
            this[getController](token.meta).publish(error(message, reason))
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
