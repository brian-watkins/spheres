import { Meta, error, ok, pending } from "./meta.js"

export type GetState = <S>(state: State<S>) => S

const listenerVersion = Symbol("listener-version")
const listenerParent = Symbol("listener-parent")
const notifyListeners = Symbol("notify-listeners")
const listenerStore = Symbol("listener-store")

export interface StateListener {
  [listenerVersion]?: number
  [listenerParent]?: any
  [notifyListeners]?: () => void
  [listenerStore]?: TokenRegistry
  run(get: GetState): void
}

export interface ReactiveEffect extends StateListener {
  init?: (get: GetState) => void
}

interface StateEventSource {
  addListener(listener: StateListener): void
}

export interface StateController<T> extends StateEventSource {
  getValue(): T
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

const createController = Symbol("createController")
const initializeCommand = Symbol("initializeCommand")
const initialValue = Symbol("initialValue")

export interface Token {
  id: string | undefined
}

interface ContainerController<T, M = T> extends StateController<T> {
  write(message: M): void
  accept(message: M): void
  publish(value: T): void
}

class SimpleStateEventSource implements StateEventSource {
  private listeners: Map<StateListener, number> = new Map()

  constructor(protected registry: TokenRegistry) { }

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
        const registry = listener[listenerStore] ?? this.registry
        listener.run(reactiveState(registry, listener))
        listener[listenerParent] = undefined
      }
    }
  }
}

class SimpleStateController<T> extends SimpleStateEventSource implements ContainerController<T> {
  constructor(protected registry: TokenRegistry, private _value: T) {
    super(registry)
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

  getValue(): T {
    return this._value
  }
}

export abstract class State<T> implements Token {
  constructor(readonly id: string | undefined, readonly name: string | undefined) { }

  abstract [createController](registry: TokenRegistry, initialState?: T): StateController<T>

  toString() {
    return this.name && this.id ? `${this.name}-${this.id}` : (this.name ?? this.id ?? "State")
  }
}

export class Constant<T> extends State<T> {
  constructor(private initialValue: T) {
    super(undefined, undefined)
  }

  [createController](_: TokenRegistry, initialState?: T | undefined): StateController<T> {
    return new ConstantStateController(initialState ?? this.initialValue)
  }
}

export class ConstantStateController<T> implements StateController<T> {
  constructor(private value: T) { }

  addListener(): void { }

  removeListener(): void { }

  setValue(value: T) {
    this.value = value
  }

  getValue(): T {
    return this.value
  }
}

export class MetaState<T, M, E = unknown> extends State<Meta<M, E>> {
  constructor(private token: State<T>) {
    super(token.id ? `meta[${token.id}]` : undefined, `meta[${token.toString()}]`)
  }

  [createController](registry: TokenRegistry): StateController<Meta<M, E>> {
    const tokenController = registry.get<StateController<any>>(this.token)

    const controller = new SimpleStateController<Meta<M, E>>(registry, ok())

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

  [createController](registry: TokenRegistry, serializedState?: T): ContainerController<T, M> {
    return new SimpleStateController(registry, serializedState ?? this.initialValue)
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

  [createController](registry: TokenRegistry, serializedState?: T): ContainerController<T, M> {
    return this.update ?
      new MessagePassingStateController(registry, serializedState ?? this.initialValue, this.update) :
      new SimpleStateController(registry, serializedState ?? this.initialValue)
  }

  get meta(): MetaState<T, M, E> {
    if (this._meta === undefined) {
      this._meta = new MetaState(this)
    }
    return this._meta
  }
}

export class DerivedState<T> extends State<T> {
  constructor(id: string | undefined, name: string | undefined, private derivation: (get: GetState) => T) {
    super(id, name)
  }

  [createController](registry: TokenRegistry): StateController<T> {
    return new DerivedStateController(registry, this.derivation)
  }
}

class DerivedStateController<T> extends SimpleStateEventSource implements StateController<T>, StateListener {
  private _value: T
  [listenerVersion] = 0;

  constructor(registry: TokenRegistry, private derivation: (get: GetState) => T) {
    super(registry)
    this._value = this.derivation(reactiveState(registry, this))
  }

  run(_: GetState): void {
    const derived = this.derivation(reactiveState(this.registry, this))

    if (Object.is(derived, this._value)) {
      return
    }

    this._value = derived

    this.runListeners()
  }

  getValue(): T {
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

export class Command<M> implements Token {
  readonly id: undefined

  constructor(private trigger: ((get: GetState) => M) | undefined) { }

  [createController](registry: TokenRegistry): CommandController<M> {
    return new CommandController(registry)
  }

  [initializeCommand](store: Store): void {
    if (this.trigger !== undefined) {
      store.useEffect(new DispatchCommandQuery(store, this, this.trigger))
    }
  }
}

function defaultCommandManager(): CommandManager<any> {
  return {
    exec() {
      console.log("No CommandManager defined for Command!")
    },
  }
}

export class CommandController<T> {
  private manager: CommandManager<T> = defaultCommandManager()

  constructor(private registry: TokenRegistry) { }

  setManager(manager: CommandManager<T>) {
    this.manager = manager
  }

  run(message: T) {
    this.manager.exec(message, {
      get: (state) => {
        return this.registry.get<StateController<any>>(state).getValue()
      },
      supply: (token, value) => {
        this.registry.get<ContainerController<any>>(token).publish(value)
      },
      pending: (token, message) => {
        this.registry.get<ContainerController<any>>(token.meta).write(pending(message))
      },
      error: (token, message, reason) => {
        this.registry.get<ContainerController<any>>(token.meta).write(error(message, reason))
      }
    })
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

export interface TokenRegistry {
  get<C>(token: Token): C
  set(token: State<any>, controller: any): void
  registerState<T>(token: State<T>, initialState?: T): StateController<T>
  registerCommand(token: Command<any>): CommandController<any>
}

function reactiveState(registry: TokenRegistry, listener: StateListener): <T>(token: State<T>) => T {
  return function (token) {
    const controller = registry.get<StateController<any>>(token)
    controller.addListener(listener)
    return controller.getValue()
  }
}

class SerializableTokenRegistry implements TokenRegistry {
  protected registry: WeakMap<Token, any> = new WeakMap();
  protected tokenIdMap: Map<string, Token> = new Map();

  constructor(private options: StoreOptions = {}) { }

  registerState<T>(token: State<any>, initialState?: T): StateController<T> {
    const controller = token[createController](this, initialState)
    this.registry.set(token, controller)
    return controller
  }

  registerCommand(token: Command<any>): CommandController<any> {
    const controller = token[createController](this)
    this.registry.set(token, controller)
    return controller
  }

  private getRegistryKey<K extends Token>(token: K): K {
    if (token.id === undefined) return token

    const key = this.tokenIdMap.get(token.id) as K
    if (key === undefined) {
      this.tokenIdMap.set(token.id, token)
      return token
    }

    return key
  }

  get<C>(token: Token): C {
    const key = this.getRegistryKey(token)
    let controller = this.registry.get(key)
    if (controller === undefined) {
      if (token instanceof State) {
        const initialState = token.id ? this.options.initialState?.get(token.id) : undefined
        controller = this.registerState(key as State<any>, initialState)
      } else if (token instanceof Command) {
        controller = this.registerCommand(key as Command<any>)
      }
    }
    return controller
  }

  set(token: State<any>, controller: any) {
    this.registry.set(this.getRegistryKey(token), controller)
  }

  serialize(): string {
    const map_data = Array.from(this.tokenIdMap.entries())
    .map(([key, token]) => {
      const value = this.get<StateController<any>>(token).getValue()
      return `["${key}",${JSON.stringify(value)}]`
    })
    .join(",")

  return `<script type="module">
window[Symbol.for("${storeId(this.options.id)}")] = new Map([${map_data}]);
</script>`
  }
}

export function createStateController(registry: TokenRegistry, token: State<any>, initialValue?: any): StateController<any> {
  return token[createController](registry, initialValue)
}

export function dispatchMessage(registry: TokenRegistry, message: StoreMessage<any>) {
  switch (message.type) {
    case "write": {
      registry.get<ContainerController<any>>(message.container).write(message.value)
      break
    }
    case "update": {
      const controller = registry.get<ContainerController<any>>(message.container)
      controller.write(message.generator(controller.getValue()))
      break
    }
    case "exec": {
      registry.get<CommandController<any>>(message.command).run(message.message)
      break
    }
    case "reset": {
      const controller = registry.get<ContainerController<any>>(message.container)
      controller.write(message.container[initialValue])
      break
    }
    case "use": {
      const get: GetState = (state) => registry.get<StateController<any>>(state).getValue()
      const statefulMessage = message.rule(get) ?? { type: "batch", messages: [] }
      dispatchMessage(registry, statefulMessage)
      break
    }
    case "run": {
      message.effect()
      break
    }
    case "batch": {
      for (let i = 0; i < message.messages.length; i++) {
        dispatchMessage(registry, message.messages[i])
      }
      break
    }
  }
}

export function registerEffect(registry: TokenRegistry, effect: ReactiveEffect): ReactiveEffectHandle {
  effect[listenerVersion] = 0
  effect[listenerStore] = registry

  if (effect.init !== undefined) {
    effect.init(reactiveState(registry, effect))
  } else {
    effect.run(reactiveState(registry, effect))
  }

  return {
    unsubscribe: () => {
      effect[listenerVersion] = effect[listenerVersion]! + 1
    }
  }
}

const tokenRegistry = Symbol("tokenRegistry")

export function getTokenRegistry(store: Store): TokenRegistry {
  return store[tokenRegistry]
}

export class Store {
  private registry: SerializableTokenRegistry

  constructor(options: StoreOptions = {}) {
    this.registry = new SerializableTokenRegistry(options)
  }

  get [tokenRegistry](): TokenRegistry {
    return this.registry
  }

  dispatch(message: StoreMessage<any>) {
    dispatchMessage(this.registry, message)
  }

  useEffect(effect: ReactiveEffect): ReactiveEffectHandle {
    return registerEffect(this.registry, effect)
  }

  useHooks(hooks: StoreHooks) {
    this.registry = new Proxy(this.registry, {
      get(target, prop, receiver) {
        if (prop === "registerState") {
          return (token: State<any>): StateController<any> => {
            const controller = target.registerState(token)
            if (token instanceof Container) {
              hooks.onRegister(token)
            }
            return controller
          }
        }
        return Reflect.get(target, prop, receiver)
      },
    })
  }

  useCommand<M>(command: Command<M>, manager: CommandManager<M>) {
    const controller = this.registry.get<CommandController<M>>(command)
    controller.setManager(manager)
    command[initializeCommand](this)
  }

  useContainerHooks<T, M, E>(container: Container<T, M>, hooks: ContainerHooks<T, M, E>) {
    const controllerWithHooks = this.containerControllerWithHooks(container, this.registry.get<ContainerController<any>>(container), hooks)
    this.registry.set(container, controllerWithHooks)

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

  private containerReadyActions<T, M, E>(container: Container<T, M>, controller: ContainerController<T, M>): ReadyHookActions<T, M, E> {
    return {
      get: (state) => {
        return this.registry.get<StateController<any>>(state).getValue()
      },
      supply: (value) => {
        controller.publish(value)
      },
      pending: (message) => {
        this.registry.get<ContainerController<any>>(container.meta).publish(pending(message))
      },
      error: (message, reason) => {
        this.registry.get<ContainerController<any>>(container.meta).publish(error(message, reason))
      },
      current: controller.getValue()
    }
  }

  private containerWriteActions<T, M, E>(container: Container<T, M>, controller: ContainerController<T, M>): WriteHookActions<T, M, E> {
    return {
      get: (state) => {
        return this.registry.get<StateController<any>>(state).getValue()
      },
      ok: (message) => {
        controller.accept(message)
      },
      pending: (message) => {
        this.registry.get<ContainerController<any>>(container.meta).write(pending(message))
      },
      error: (message, reason) => {
        this.registry.get<ContainerController<any>>(container.meta).write(error(message, reason))
      },
      current: controller.getValue()
    }
  }

  serialize(): string {
    return this.registry.serialize()
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
  constructor(registry: TokenRegistry, initialValue: T, private update: ((message: M, current: T) => UpdateResult<T>)) {
    super(registry, initialValue)
  }

  accept(message: M): void {
    const result = this.update(message, this.getValue())
    this.publish(result.value)
    if (result.message !== undefined) {
      dispatchMessage(this.registry, result.message)
    }
  }
}