import { Meta, error, ok, pending } from "./meta.js"

export type GetState = <S>(state: State<S>) => S

const listenerVersion = Symbol("listener-version")
const listenerParent = Symbol("listener-parent")
const notifyListeners = Symbol("notify-listeners")

export interface StateListener {
  [listenerVersion]?: number
  [listenerParent]?: StateEventSource
  [notifyListeners]?: () => void
  run: (get: GetState) => void
}

export interface ReactiveEffect extends StateListener {
  init?: (get: GetState) => void
}

interface StateEventSource {
  addListener(listener: StateListener): void
  removeListener(listener: StateListener): void
}

interface StateController<T> extends StateEventSource {
  value: T
}

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

export interface ContainerHooks<T, M, E = unknown> {
  onReady?(actions: ReadyHookActions<T, M, E>): void
  onWrite?(message: M, actions: WriteHookActions<T, M, E>): void
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

export interface UseMessage {
  type: "use"
  rule: (get: GetState) => StoreMessage<any> | undefined
}

export interface RunMessage {
  type: "run"
  effect: () => void
}

export interface BatchMessage {
  type: "batch"
  messages: Array<StoreMessage<any>>
}

export type StoreMessage<T, M = T> = WriteMessage<T, M> | UpdateMessage<T, M> | ResetMessage<T, M> | UseMessage | BatchMessage | RunMessage | ExecMessage<M>

const registerState = Symbol("registerState")
const initializeCommand = Symbol("initializeCommand")
const getController = Symbol("getController")
const setController = Symbol("setController")
const getContainerController = Symbol("getContainerController")
const initialValue = Symbol("initialValue")
const getValue = Symbol("getValue")

type StoreRegistryKey = State<any>

interface ContainerController<T, M = T> extends StateController<T> {
  write(message: M): void
  accept(message: M): void
  publish(value: T): void
}

class SimpleStateEventSource implements StateEventSource {
  private listeners: Map<StateListener, number> = new Map()

  constructor(protected store: Store) { }

  addListener(listener: StateListener) {
    this.listeners.set(listener, listener[listenerVersion]!)
  }

  removeListener(listener: StateListener) {
    this.listeners.delete(listener)
  }

  [notifyListeners]() {
    for (const [listener, version] of this.listeners) {
      if (version === listener[listenerVersion]) {
        listener[listenerParent] = this
        listener[notifyListeners]?.()
      } else {
        this.removeListener(listener)
      }
    }
  }

  protected runListeners() {
    for (const listener of this.listeners.keys()) {
      if (listener[listenerParent] === this) {
        listener[listenerVersion] = listener[listenerVersion]! + 1
        listener.run((token) => this.store[getValue](listener, token))
        listener[listenerParent] = undefined
      }
    }
  }
}

class SimpleStateController<T> extends SimpleStateEventSource implements ContainerController<T> {
  constructor(protected store: Store, private _value: T) {
    super(store)
  }

  write(value: any) {
    this.accept(value)
  }

  accept(value: any) {
    this.publish(value)
  }

  publish(value: T) {
    if (Object.is(this._value, value)) return

    this._value = value

    this[notifyListeners]()

    this.runListeners()
  }

  get value(): T {
    return this._value
  }
}

export abstract class State<T> {
  constructor(readonly id: string | undefined, readonly name: string | undefined) { }

  abstract [registerState](store: Store, initialState?: T): StateController<T>

  toString() {
    return this.name && this.id ? `${this.name}-${this.id}` : (this.name ?? this.id ?? "State")
  }
}

export class Variable<T> extends State<T> {
  private controller: ConstantStateController<T>

  constructor(private initialValue: T) {
    super(undefined, undefined)
    this.controller = new ConstantStateController(this.initialValue)
  }

  [registerState](_: Store): StateController<T> {
    return this.controller
  }

  assignValue(value: T) {
    this.controller.value = value
  }
}

export class ReactiveVariable<T> extends State<T> {
  private store: Store | undefined

  constructor(private initialValue: State<T>) {
    super(undefined, undefined)
  }

  [registerState](store: Store): StateController<T> {
    this.store = store
    return this.store[getController](this.initialValue)
  }

  assignState(token: Container<T>) {
    if (!this.store) {
      this.initialValue = token
    } else {
      const proxiedController = this.store[getController](token)
      this.store[setController](this, proxiedController)
    }
  }
}

export class MetaState<T, M, E = unknown> extends State<Meta<M, E>> {
  constructor(private token: State<T>) {
    super(token.id ? `meta[${token.id}]` : undefined, `meta[${token.toString()}]`)
  }

  [registerState](store: Store): StateController<Meta<M, E>> {
    const tokenController = store[getController](this.token)

    const controller = new SimpleStateController<Meta<M, E>>(store, ok())

    tokenController.addListener({
      get [listenerVersion]() { return 0 },
      set [listenerVersion](_: number) { },
      run: () => { controller.write(ok()) }
    })

    return controller
  }
}

export class SuppliedState<T, M = any, E = any> extends State<T> {
  private _meta: MetaState<T, M, E> | undefined

  constructor(id: string | undefined, name: string | undefined, private initialValue: T) {
    super(id, name)
  }

  [registerState](store: Store, serializedState?: T): ContainerController<T, M> {
    return new SimpleStateController(store, serializedState ?? this.initialValue)
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

  [registerState](store: Store, serializedState?: T): ContainerController<T, M> {
    return this.update ?
      new MessagePassingStateController(store, serializedState ?? this.initialValue, this.update) :
      new SimpleStateController(store, serializedState ?? this.initialValue)
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

class ConstantStateController<T> implements StateController<T> {
  constructor(public value: T) { }

  addListener(): void { }

  removeListener(): void { }
}

class DerivedStateController<T> extends SimpleStateEventSource implements StateController<T>, StateListener {
  private _value: T
  [listenerVersion] = 0;

  constructor(store: Store, private derivation: (get: GetState, current: T | undefined) => T) {
    super(store)
    this._value = this.derivation((token) => this.store[getValue](this, token), undefined)
  }

  run(get: GetState): void {
    const derived = this.derivation(get, this._value)

    const derivedValueIsNew = !Object.is(derived, this._value)

    this._value = derived

    if (derivedValueIsNew) {
      this.runListeners()
    }
  }

  get value(): T {
    return this._value
  }
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

interface StoreOptions {
  id?: string
  initialState?: Map<string, any>
}

export class Store {
  private registry: WeakMap<StoreRegistryKey, StateController<any>> = new WeakMap();
  private commandRegistry: Map<Command<any>, CommandManager<any>> = new Map()
  private hooks: StoreHooks | undefined
  private tokenIdMap: Map<string, StoreRegistryKey> = new Map();

  constructor(private options: StoreOptions = {}) { }

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
      const initialState = token.id ? this.options.initialState?.get(token.id) : undefined
      controller = token[registerState](this, initialState)
      this.registry.set(key, controller)
      if (this.hooks !== undefined && token instanceof Container) {
        this.hooks.onRegister(token)
      }
    }
    return controller
  }

  [setController]<T>(token: State<T>, controller: StateController<T>) {
    // NOTE -- This should probably use getKeyForToken probably
    //         But we only use this now for list index tokens which do
    //         not have an id.
    this.registry.set(token, controller)
  }

  [getContainerController]<T, M>(token: State<T>): ContainerController<T, M> {
    return this[getController](token) as ContainerController<T, M>
  }

  useHooks(hooks: StoreHooks) {
    this.hooks = hooks
  }

  [getValue]<S>(listener: StateListener, token: State<S>,): S {
    const controller = this[getController](token)
    controller.addListener(listener)

    return controller.value
  }

  useEffect(effect: ReactiveEffect): ReactiveEffectHandle {
    effect[listenerVersion] = 0

    if (effect.init !== undefined) {
      effect.init((state) => this[getValue](effect, state))
    } else {
      effect.run((state) => this[getValue](effect, state))
    }

    return {
      unsubscribe: () => {
        effect[listenerVersion] = effect[listenerVersion]! + 1
      }
    }
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
      case "write": {
        this[getContainerController](message.container).write(message.value)
        break
      }
      case "update": {
        const controller = this[getContainerController](message.container)
        controller.write(message.generator(controller.value))
        break
      }
      case "exec": {
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
      }
      case "reset": {
        const controller = this[getContainerController](message.container)
        controller.write(message.container[initialValue])
        break
      }
      case "use": {
        const get: GetState = (state) => this[getController](state).value
        const statefulMessage = message.rule(get) ?? { type: "batch", messages: [] }
        this.dispatch(statefulMessage)
        break
      }
      case "run": {
        message.effect()
        break
      }
      case "batch": {
        for (let i = 0; i < message.messages.length; i++) {
          this.dispatch(message.messages[i])
        }
        break
      }
    }
  }

  serialize(): string {
    const map_data = Array.from(this.tokenIdMap.entries())
      .map(([key, token]) => {
        const value = this[getController](token).value
        return `["${key}",${JSON.stringify(value)}]`
      })
      .join(",")

    return `<script type="module">
window[Symbol.for("${storeId(this.options.id)}")] = new Map([${map_data}]);
</script>`
  }
}

interface SpheresDecoratedWindow extends Window {
  [key: symbol]: any
}

declare let window: SpheresDecoratedWindow

export function activateStore(id?: string): Store {
  return new Store({
    id,
    initialState: window[Symbol.for(storeId(id))]
  })
}

export function createStore(id?: string): Store {
  return new Store({
    id
  })
}

function storeId(id: string | undefined): string {
  return `_spheres_store_data_${id ?? ""}`
}

export interface UpdateResult<T> {
  value: T
  message?: StoreMessage<any>
}

class MessagePassingStateController<T, M> extends SimpleStateController<T> implements ContainerController<T, M> {
  constructor(store: Store, initialValue: T, private update: ((message: M, current: T) => UpdateResult<T>)) {
    super(store, initialValue)
  }

  accept(message: M): void {
    const result = this.update(message, this.value)
    this.publish(result.value)
    if (result.message !== undefined) {
      this.store.dispatch(result.message)
    }
  }
}