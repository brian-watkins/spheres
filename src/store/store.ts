import { Container } from "./state/container.js"
import { dispatchMessage, StoreMessage } from "./message.js"
import { error, Meta, ok, pending, WithMetaState } from "./state/meta.js"
import { WeakMapTokenRegistry } from "./registry/weakMapTokenRegistry.js"
import { Command, getStateHandler, GetState, initializeCommand, initListener, runQuery, StateEffect, StateListenerType, StateReference, StateWriter, Subscriber, TokenRegistry, PublishableState } from "./tokenRegistry.js"
import { CommandManager, ManagedCommandController } from "./command/managedCommandController.js"
import { RootTokenRegistry } from "./registry/rootTokenRegistry.js"

export interface StoreInitializerActions {
  get: GetState
  supply<T>(container: PublishableState<T>, value: T): void
  pending<T, M>(container: WithMetaState<T, M>, ...value: NoInfer<M> extends never ? [] : [NoInfer<M>]): void
  error<T, M, E>(container: WithMetaState<T, M, E>, reason: E, ...message: NoInfer<M> extends never ? [] : [NoInfer<M>]): void
}

export interface StoreOptions {
  id?: string
  init?: (actions: StoreInitializerActions, store: Store) => Promise<void>
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
  onWrite(message: M, actions: WriteHookActions<T, M, E>): void
}

export interface RegisterHookActions {
  get: GetState,
  supply(value: any): void
  pending(value?: any): void
  error(reason: any, value: any): void
}

export interface StoreHooks {
  onRegister(container: Container<any>, actions: RegisterHookActions): void
}

export interface ReactiveEffect {
  init?: (get: GetState) => void
  run: (get: GetState) => void
}

export interface ReactiveEffectHandle {
  unsubscribe: () => void
}

const tokenRegistry = Symbol("tokenRegistry")
const setTokenRegistry = Symbol("set-tokenRegistry")

export function getTokenRegistry(store: Store): RootTokenRegistry {
  return store[tokenRegistry]()
}

export class Store {
  private registry: RootTokenRegistry
  readonly id: string
  private initializerPromise: Promise<void> | undefined

  constructor(options: StoreOptions = {}) {
    this.id = storeId(options.id)
    this.registry = new WeakMapTokenRegistry()

    if (options.init) {
      this.initializerPromise = this.initialize(options.init)
    }
  }

  private initialize(initializer: (actions: StoreInitializerActions, store: Store) => Promise<void>): Promise<void> {
    return initializer(initializerActions(this.registry), this)
  }

  get initialized(): Promise<void> {
    if (this.initializerPromise !== undefined) {
      return this.initializerPromise
    } else {
      return Promise.resolve()
    }
  }

  [tokenRegistry](): RootTokenRegistry {
    return this.registry
  }

  [setTokenRegistry](registry: RootTokenRegistry) {
    this.registry = registry
  }

  dispatch(message: StoreMessage<any>) {
    dispatchMessage(this.registry, message)
  }
}

export function useEffect(store: Store, effect: ReactiveEffect): ReactiveEffectHandle {
  return new EffectListener(getTokenRegistry(store), effect)
}

export function useCommand<M>(store: Store, command: Command<M>, manager: CommandManager<NoInfer<M>>) {
  const registry = getTokenRegistry(store)
  const controller = new ManagedCommandController(registry, manager)
  registry.setCommand(command, controller)
  command[initializeCommand](registry)
}

export function useHooks(store: Store, hooks: StoreHooks) {
  getTokenRegistry(store).onRegister((token) => {
    const registry = getTokenRegistry(store)
    hooks.onRegister(token, {
      get: (state) => runQuery(registry, get => get(state)),
      supply: (value) => {
        token[getStateHandler](registry).publish(value)
      },
      pending: (value) => {
        token.meta[getStateHandler](registry).publish(pending(value))
      },
      error: (reason, value) => {
        token.meta[getStateHandler](registry).publish(error(reason, value))
      }
    })
  })
}

export function useContainerHooks<T, M, E>(store: Store, container: Container<T, M, E>, hooks: ContainerHooks<NoInfer<T>, NoInfer<M>, NoInfer<E>>) {
  const registry = getTokenRegistry(store)
  const writerWithHooks = stateWriterWithHooks(registry, container, registry.getState(container), hooks)
  registry.setState(container, writerWithHooks)
}

function stateWriterWithHooks<T, M, E>(registry: TokenRegistry, container: Container<T, M, E>, writer: StateWriter<T, M>, hooks: ContainerHooks<T, M, E>): StateWriter<T, M> {
  if (hooks.onWrite) {
    return new Proxy(writer, {
      get: (target, prop, receiver) => {
        if (prop === "write") {
          return (message: any) => {
            hooks.onWrite!(message, containerWriteActions(registry, container, target))
          }
        }
        return Reflect.get(target, prop, receiver)
      }
    })
  } else {
    return writer
  }
}

function initializerActions(registry: TokenRegistry): StoreInitializerActions {
  return {
    get: (state) => runQuery(registry, get => get(state)),
    supply: <T>(writable: PublishableState<T>, value: T) => {
      writable[getStateHandler](registry).publish(value)
    },
    pending: <T, M, E>(writable: WithMetaState<T, M>, ...message: NoInfer<M> extends never ? [] : [NoInfer<M>]) => {
      if (message.length === 0) {
        writable.meta[getStateHandler](registry).publish(pending(undefined) as Meta<never, E>)
      } else {
        writable.meta[getStateHandler](registry).publish(pending(message[0]))
      }
    },
    error: <T, M, E>(writable: WithMetaState<T, M, E>, reason: E, ...message: NoInfer<M> extends never ? [] : [NoInfer<M>]) => {
      if (message.length === 0) {
        writable.meta[getStateHandler](registry).publish(error(reason, undefined) as Meta<never, E>)
      } else {
        writable.meta[getStateHandler](registry).publish(error(reason, message[0]))
      }
    }
  }
}

function containerWriteActions<T, M, E>(registry: TokenRegistry, container: Container<T, M>, writer: StateWriter<T, M>): WriteHookActions<T, M, E> {
  return {
    get: (state) => runQuery(registry, get => get(state)),
    ok: (message) => {
      writer.write(message)
      registry.getState(container.meta).publish(ok())
    },
    pending: (message) => {
      registry.getState(container.meta).publish(pending(message))
    },
    error: (reason, message) => {
      registry.getState(container.meta).publish(error(reason, message))
    },
    current: writer.getValue()
  }
}

export class EffectListener implements StateEffect, ReactiveEffectHandle {
  readonly type = StateListenerType.UserEffect
  private dependencies = new Set<StateReference<any>>()
  private subscriber: Subscriber

  constructor(private registry: TokenRegistry, private effect: ReactiveEffect) {
    this.subscriber = initListener(registry, this)
  }

  init(get: GetState): void {
    if (this.effect.init !== undefined) {
      this.effect.init((ref) => {
        this.dependencies.add(ref)
        return get(ref)
      })
    } else {
      this.effect.run((ref) => {
        this.dependencies.add(ref)
        return get(ref)
      })
    }
  }

  run(get: GetState): void {
    this.dependencies.clear()
    this.effect.run((ref) => {
      this.dependencies.add(ref)
      return get(ref)
    })
  }

  unsubscribe() {
    for (const token of this.dependencies) {
      token[getStateHandler](this.registry).removeSubscriber(this.subscriber)
    }
    this.dependencies.clear()
  }
}

function storeId(id: string | undefined): string {
  return `_spheres_store_data_${id ?? ""}`
}