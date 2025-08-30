import { Container } from "./state/container.js"
import { dispatchMessage, StoreMessage } from "./message.js"
import { error, Meta, ok, pending } from "./state/meta.js"
import { WeakMapTokenRegistry } from "./store/weakMapTokenRegistry.js"
import { StateWriter } from "./state/publisher/stateWriter.js"
import { Command, GetState, initializeCommand, initListener, StateListener, StateListenerType, StateListenerVersion, TokenRegistry } from "./tokenRegistry.js"
import { CommandManager, ManagedCommandController } from "./command/managedCommandController.js"

export interface StoreOptions {
  id?: string
  init?: (actions: InitializerActions, store: Store) => Promise<void>
}

export function createStore(options: StoreOptions = {}): Store {
  return new Store(options)
}

export interface WriteHookActions<T, M, E> {
  get: GetState
  ok(value: M): void
  pending(value: M): void
  error(reason: E, value: M): void
  current: T
}

export interface ContainerHooks<T, M, E = unknown> {
  onWrite?(message: M, actions: WriteHookActions<T, M, E>): void
}

export interface StoreHooks {
  onRegister(container: Container<any>): void
}

export interface ReactiveEffect {
  init?: (get: GetState) => void
  run: (get: GetState) => void
}

export interface ReactiveEffectHandle {
  unsubscribe: () => void
}

const tokenRegistry = Symbol("tokenRegistry")

export function getTokenRegistry(store: Store): TokenRegistry {
  return store[tokenRegistry]
}

export interface InitializerActions {
  get: GetState
  supply<T, M>(container: Container<T, M>, value: T): void
  pending<T, M>(container: Container<T, M>, ...value: NoInfer<M> extends never ? [] : [NoInfer<M>]): void
  error<T, M, E>(container: Container<T, M, E>, reason: E, ...message: NoInfer<M> extends never ? [] : [NoInfer<M>]): void
}

export class Store {
  private registry: TokenRegistry
  readonly id: string
  private initializerPromise: Promise<void> | undefined

  constructor(options: StoreOptions = {}) {
    this.id = storeId(options.id)
    this.registry = new WeakMapTokenRegistry()

    if (options.init) {
      this.initializerPromise = this.initialize(options.init)
    }
  }

  private initialize(initializer: (actions: InitializerActions, store: Store) => Promise<void>): Promise<void> {
    return initializer(initializerActions(this.registry), this)
  }

  get initialized(): Promise<void> {
    if (this.initializerPromise !== undefined) {
      return this.initializerPromise
    } else {
      return Promise.resolve()
    }
  }

  get [tokenRegistry](): TokenRegistry {
    return this.registry
  }

  set [tokenRegistry](registry: TokenRegistry) {
    this.registry = registry
  }

  dispatch(message: StoreMessage<any>) {
    dispatchMessage(this.registry, message)
  }
}

export function useEffect(store: Store, effect: ReactiveEffect): ReactiveEffectHandle {
  const registry = getTokenRegistry(store)
  const listener = new EffectListener(registry, effect)
  initListener(listener)
  return listener
}

export function useCommand<M>(store: Store, command: Command<M>, manager: CommandManager<NoInfer<M>>) {
  const registry = getTokenRegistry(store)
  const controller = new ManagedCommandController(registry, manager)
  registry.setCommand(command, controller)
  command[initializeCommand](registry)
}

export function useHooks(store: Store, hooks: StoreHooks) {
  getTokenRegistry(store).onRegister((token) => {
    if (token instanceof Container) {
      hooks.onRegister(token)
    }
  })
}

export function useContainerHooks<T, M, E>(store: Store, container: Container<T, M>, hooks: ContainerHooks<NoInfer<T>, NoInfer<M>, NoInfer<E>>) {
  const registry = getTokenRegistry(store)
  const writerWithHooks = stateWriterWithHooks(registry, container, registry.getState<StateWriter<any>>(container), hooks)
  registry.setState(container, writerWithHooks)
}

function stateWriterWithHooks<T, M, E>(registry: TokenRegistry, container: Container<T, M, E>, writer: StateWriter<T>, hooks: ContainerHooks<T, M, E>): StateWriter<T> {
  let withHooks: StateWriter<T> = writer
  if (hooks.onWrite) {
    withHooks = new Proxy(withHooks, {
      get: (target, prop, receiver) => {
        if (prop === "accept") {
          return (message: any) => {
            hooks.onWrite!(message, containerWriteActions(registry, container, target))
          }
        }
        return Reflect.get(target, prop, receiver)
      }
    })
  }
  return withHooks
}

function initializerActions(registry: TokenRegistry): InitializerActions {
  return {
    get: (state) => {
      return registry.getState(state).getValue()
    },
    supply: <T, M>(container: Container<T, M>, value: T) => {
      registry.getState<StateWriter<T>>(container).publish(value)
    },
    pending: <T, M, E>(container: Container<T, M>, ...message: NoInfer<M> extends never ? [] : [NoInfer<M>]) => {
      if (message.length === 0) {
        registry.getState<StateWriter<Meta<undefined, E>>>(container.meta).publish(pending(undefined))
      } else {
        registry.getState<StateWriter<Meta<M, E>>>(container.meta).publish(pending(message[0]))
      }
    },
    error: <T, M, E>(container: Container<T, M, E>, reason: E, ...message: NoInfer<M> extends never ? [] : [NoInfer<M>]) => {
      if (message.length === 0) {
        registry.getState<StateWriter<Meta<undefined, E>>>(container.meta).publish(error(reason, undefined))
      } else {
        registry.getState<StateWriter<Meta<M, E>>>(container.meta).publish(error(reason, message[0]))
      }
    }
  }
}

function containerWriteActions<T, M, E>(registry: TokenRegistry, container: Container<T, M>, writer: StateWriter<T>): WriteHookActions<T, M, E> {
  return {
    get: (state) => {
      return registry.getState(state).getValue()
    },
    ok: (message) => {
      writer.accept(message)
      registry.getState<StateWriter<any>>(container.meta).write(ok())
    },
    pending: (message) => {
      registry.getState<StateWriter<any>>(container.meta).write(pending(message))
    },
    error: (reason, message) => {
      registry.getState<StateWriter<any>>(container.meta).write(error(reason, message))
    },
    current: writer.getValue()
  }
}

export class EffectListener implements StateListener, ReactiveEffectHandle {
  readonly type = StateListenerType.UserEffect
  version: StateListenerVersion = 0

  constructor(public registry: TokenRegistry, private effect: ReactiveEffect) { }

  init(get: GetState): void {
    if (this.effect.init !== undefined) {
      this.effect.init(get)
    } else {
      this.effect.run(get)
    }
  }

  run(get: GetState): void {
    this.effect.run(get)
  }

  unsubscribe() {
    this.version = -1
  }
}

function storeId(id: string | undefined): string {
  return `_spheres_store_data_${id ?? ""}`
}