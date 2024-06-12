import { ContainerController, SimpleStateController, StateController, StateListener } from "./controller.js"
import { Meta, error, ok, pending } from "./meta.js"

export type GetState = <S>(state: State<S>) => S

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
const getContainerController = Symbol("getContainerController")
const initialValue = Symbol("initialValue")

type StoreRegistryKey = State<any>

export abstract class State<T> {
  constructor(readonly id: string | undefined, readonly name: string | undefined) { }

  abstract [registerState](store: Store): StateController<T>

  toString() {
    return this.name && this.id ? `${this.name}-${this.id}` : (this.name ?? this.id ?? "State")
  }
}

export class MetaState<T, M, E = unknown> extends State<Meta<M, E>> {
  constructor(private token: State<T>) {
    super(token.id ? `meta[${token.id}]` : undefined, `meta[${token.toString()}]`)
  }

  [registerState](store: Store): StateController<Meta<M, E>> {
    const tokenController = store[getController](this.token)

    const controller = new SimpleStateController<Meta<M, E>>(ok())

    tokenController.addListener({
      notify: () => true,
      update: () => {
        controller.write(ok())
      }
    }, 0)

    return controller
  }
}

export class SuppliedState<T, M = any, E = any> extends State<T> {
  private _meta: MetaState<T, M, E> | undefined

  constructor(id: string | undefined, name: string | undefined, private initialValue: T) {
    super(id, name)
  }

  [registerState](_: Store): ContainerController<T, M> {
    return new SimpleStateController(this.initialValue)
  }

  get meta(): MetaState<T, M, E> {
    if (this._meta === undefined) {
      this._meta = new MetaState(this)
    }
    return this._meta
  }
}

export class Container<T, M = T, E = any> extends State<T> {
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

  [registerState](store: Store): ContainerController<T, M> {
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

  [registerState](store: Store): StateController<T> {
    return new DerivedStateController(store, this.derivation)
  }
}

interface UpdateTracker {
  notifications: number
  hasChanged: boolean
}

class DependencyTrackingStateListener implements StateListener {
  private version = 0
  private updateTracker: UpdateTracker | undefined

  constructor(private store: Store) { }

  notify(version: number): boolean {
    if (version !== this.version) return false

    if (this.updateTracker === undefined) {
      this.startDependencyUpdate()
      this.dependenciesWillUpdate()
    }

    this.dependencyDidNotify()

    return true
  }

  update(hasChanged: boolean): void {
    this.dependencyDidUpdate(hasChanged)

    if (this.allDependenciesUpdated()) {
      this.dependenciesHaveUpdated(this.shouldUpdate())
      this.dependencyUpdateComplete()
    }
  }

  protected getValue<S>(state: State<S>): S {
    const controller = this.store[getController](state)
    controller.addListener(this, this.version)
    return controller.value
  }

  protected dependenciesWillUpdate(): void { }

  protected dependenciesHaveUpdated(_: boolean): void { }

  resetDependencies(): void {
    this.version = this.version + 1
  }

  private startDependencyUpdate() {
    this.updateTracker = { notifications: 0, hasChanged: false }
  }

  private dependencyUpdateComplete() {
    this.updateTracker = undefined
  }

  private dependencyDidNotify() {
    this.updateTracker!.notifications++
  }

  private dependencyDidUpdate(hasChanged: boolean) {
    this.updateTracker!.notifications--
    if (hasChanged) this.updateTracker!.hasChanged = true
  }

  private allDependenciesUpdated(): boolean {
    return this.updateTracker!.notifications === 0
  }

  private shouldUpdate(): boolean {
    return this.updateTracker!.hasChanged
  }
}

class DerivedStateController<T> extends DependencyTrackingStateListener implements StateController<T> {
  private listeners: Map<StateListener, number> = new Map()
  private _value: T

  constructor(store: Store, private derivation: (get: GetState, current: T | undefined) => T) {
    super(store)
    this._value = this.deriveValue()
  }

  addListener(listener: StateListener, version: number): void {
    this.listeners.set(listener, version)
  }

  removeListener(listener: StateListener): void {
    this.listeners.delete(listener)
  }

  private deriveValue() {
    return this.derivation((state) => this.getValue(state), this._value)
  }

  protected dependenciesWillUpdate(): void {
    for (const [listener, version] of this.listeners) {
      const accepted = listener.notify(version)
      if (!accepted) {
        this.removeListener(listener)
      }
    }
  }

  private updateListeners(hasChanged: boolean) {
    for (const listener of this.listeners.keys()) {
      listener.update(hasChanged)
    }
  }

  protected dependenciesHaveUpdated(hasChanged: boolean): void {
    if (!hasChanged) {
      this.updateListeners(false)
      return
    }

    this.resetDependencies()
    const derived = this.deriveValue()

    const derivedValueIsNew = !Object.is(derived, this._value)

    this._value = derived

    this.updateListeners(derivedValueIsNew)
  }

  get value(): T {
    return this._value
  }
}

class ReactiveEffectController extends DependencyTrackingStateListener {
  constructor(store: Store, private effect: ReactiveEffect) {
    super(store)
    this.init()
  }

  private init(): void {
    if (this.effect.init) {
      this.effect.init((state) => {
        return this.getValue(state)
      })
    } else {
      this.effect.run((state) => {
        return this.getValue(state)
      })
    }
  }

  protected dependenciesHaveUpdated(hasChanged: boolean): void {
    if (!hasChanged) return

    this.resetDependencies()
    this.effect.run((state) => {
      return this.getValue(state)
    })
  }

  unsubscribe() {
    this.resetDependencies()
  }
}

export interface ReactiveEffect {
  init?: (get: GetState) => void
  run: (get: GetState) => void
}

export interface ReactiveEffectHandle {
  unsubscribe: () => void
}

class DispatchCommandQuery<M> implements ReactiveEffect {
  constructor(private store: Store, private command: Command<M>, private trigger: (get: GetState) => M) { }

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
      store.useEffect(new DispatchCommandQuery(store, this, this.trigger))
    }
  }
}

export interface CommandActions {
  get<T>(state: State<T>): T
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
  private registry: WeakMap<StoreRegistryKey, StateController<any>> = new WeakMap();
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

  [getController]<T>(token: State<T>): StateController<T> {
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

  [getContainerController]<T, M>(token: State<T>): ContainerController<T, M> {
    return this[getController](token) as ContainerController<T, M>
  }

  useHooks(hooks: StoreHooks) {
    this.hooks = hooks
  }

  useEffect(effect: ReactiveEffect): ReactiveEffectHandle {
    return new ReactiveEffectController(this, effect)
  }

  useCommand<M>(command: Command<M>, handler: CommandManager<M>) {
    this.commandRegistry.set(command, handler)
    command[initializeCommand](this)
  }

  private containerReadyActions<T, M, E>(container: Container<T, M>, controller: ContainerController<T, M>): ReadyHookActions<T, M, E> {
    return {
      get: (state) => {
        return this[getController](state).value
      },
      supply: (value) => {
        controller.publish(value)
      },
      pending: (message) => {
        this[getContainerController](container.meta).publish(pending(message))
      },
      error: (message, reason) => {
        this[getContainerController](container.meta).publish(error(message, reason))
      },
      current: controller.value
    }
  }

  private containerWriteActions<T, M, E>(container: Container<T, M>, controller: ContainerController<T, M>): WriteHookActions<T, M, E> {
    return {
      get: (state) => {
        return this[getController](state).value
      },
      ok: (message) => {
        controller.accept(message)
      },
      pending: (message) => {
        this[getContainerController](container.meta).write(pending(message))
      },
      error: (message, reason) => {
        this[getContainerController](container.meta).write(error(message, reason))
      },
      current: controller.value
    }
  }

  useContainerHooks<T, M, E>(container: Container<T, M>, hooks: ContainerHooks<T, M, E>) {
    const controllerWithHooks = this.containerControllerWithHooks(container, this[getContainerController](container), hooks)
    this.registry.set(this.getKeyForToken(container), controllerWithHooks)

    if (hooks.onReady !== undefined) {
      hooks.onReady(this.containerReadyActions(container, controllerWithHooks))
    }
  }

  private containerControllerWithHooks<T, M, E>(container: Container<T, M, E>, controller: ContainerController<T, M>, hooks: ContainerHooks<T, M, E>): ContainerController<T, M> {
    let withHooks: ContainerController<T, M> = controller
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
        this[getContainerController](message.container).write(message.value)
        break
      case "update":
        const controller = this[getContainerController](message.container)
        controller.write(message.generator(controller.value))
        break
      case "exec":
        this.commandRegistry.get(message.command)?.exec(message.message, {
          get: (state) => {
            return this[getController](state).value
          },
          supply: (token, value) => {
            this[getContainerController](token).publish(value)
          },
          pending: (token, message) => {
            this[getContainerController](token.meta).write(pending(message))
          },
          error: (token, message, reason) => {
            this[getContainerController](token.meta).write(error(message, reason))
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

class MessagePassingStateController<T, M> extends SimpleStateController<T> implements ContainerController<T, M> {
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