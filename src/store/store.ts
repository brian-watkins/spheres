import { Container } from "./state/container.js"
import { dispatchMessage, StoreMessage } from "./message.js"
import { error, Meta, pending } from "./state/meta.js"
import { WeakMapTokenRegistry } from "./store/weakMapTokenRegistry.js"
import { StateWriter } from "./state/publisher/stateWriter.js"
import { Command, GetState, initializeCommand, initListener, State, StateListener, StateListenerVersion, StatePublisher, TokenRegistry } from "./tokenRegistry.js"
import { CommandManager, ManagedCommandController } from "./command/managedCommandController.js"

declare const globalThis: {
  [key: symbol]: any
} & Window

export function createStore(id?: string): Store {
  return new Store({
    id
  })
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

interface StoreOptions {
  id?: string
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

export interface Initializer<T, M, E = unknown> {
  get: GetState
  supply(value: T): void
  pending(...value: NoInfer<M> extends never ? [] : [NoInfer<M>]): void
  error(reason: E, ...message: NoInfer<M> extends never ? [] : [NoInfer<M>]): void
}

export class Store {
  private registry: TokenRegistry
  readonly id: string

  constructor(options: StoreOptions = {}) {
    this.id = storeId(options.id)
    this.registry = new WeakMapTokenRegistry()
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

  useEffect(effect: ReactiveEffect): ReactiveEffectHandle {
    const listener = new EffectListener(this.registry, effect)
    initListener(listener)
    return listener
  }

  useCommand<M>(command: Command<M>, manager: CommandManager<M>) {
    const controller = new ManagedCommandController(this.registry, manager)
    this.registry.set(command, controller)
    command[initializeCommand](this.registry)
  }

  initialize<S, T, M, E = unknown>(container: Container<T, M, E>, initializer: (actions: Initializer<T, M, E>) => S): S {
    return initializer(initializerActions(this.registry, container))
  }
}

export function useHooks(store: Store, hooks: StoreHooks) {
  const registryWithHooks = new Proxy(getTokenRegistry(store), {
    get(target, prop, receiver) {
      if (prop === "registerState") {
        return (token: State<any>, initialValue?: any): StatePublisher<any> => {
          const controller = target.registerState(token, initialValue)
          if (token instanceof Container) {
            hooks.onRegister(token)
          }
          return controller
        }
      }
      return Reflect.get(target, prop, receiver)
    },
  })

  store[tokenRegistry] = registryWithHooks
}

export function useContainerHooks<T, M, E>(store: Store, container: Container<T, M>, hooks: ContainerHooks<T, M, E>) {
  const registry = getTokenRegistry(store)
  const writerWithHooks = stateWriterWithHooks(registry, container, registry.get<StateWriter<any>>(container), hooks)
  registry.set(container, writerWithHooks)
}


interface SerializedValue {
  v: any
  mv?: Meta<any, any>
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

function initializerActions<T, M, E>(registry: TokenRegistry, container: Container<T, M>): Initializer<T, M, E> {
  const writer = registry.get<StateWriter<T>>(container)
  return {
    get: (state) => {
      return registry.get<StatePublisher<any>>(state).getValue()
    },
    supply: (value) => {
      writer.publish(value)
    },
    pending: (...message) => {
      if (message.length === 0) {
        registry.get<StateWriter<Meta<undefined, E>>>(container.meta).publish(pending(undefined))
      } else {
        registry.get<StateWriter<Meta<M, E>>>(container.meta).publish(pending(message[0]))
      }
    },
    error: (reason, ...message) => {
      if (message.length === 0) {
        registry.get<StateWriter<Meta<undefined, E>>>(container.meta).publish(error(reason, undefined))
      } else {
        registry.get<StateWriter<Meta<M, E>>>(container.meta).publish(error(reason, message[0]))
      }
    }
  }
}

function containerWriteActions<T, M, E>(registry: TokenRegistry, container: Container<T, M>, writer: StateWriter<T>): WriteHookActions<T, M, E> {
  return {
    get: (state) => {
      return registry.get<StatePublisher<any>>(state).getValue()
    },
    ok: (message) => {
      writer.accept(message)
    },
    pending: (message) => {
      registry.get<StateWriter<any>>(container.meta).write(pending(message))
    },
    error: (reason, message) => {
      registry.get<StateWriter<any>>(container.meta).write(error(reason, message))
    },
    current: writer.getValue()
  }
}

class EffectListener implements StateListener, ReactiveEffectHandle {
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

export function serialize(store: Store, map: Map<string, State<any>>): string {
  const registry = getTokenRegistry(store)
  const map_data = Array.from(map.entries())
    .map(([key, token]) => {
      const serializedValue: SerializedValue = {
        v: registry.get<StatePublisher<any>>(token).getValue(),
      }

      if (token instanceof Container) {
        const metaValue = registry.get<StatePublisher<Meta<any, any>>>(token.meta).getValue()
        if (metaValue.type !== "ok") {
          serializedValue.mv = metaValue
        }
      }

      return `["${key}",${JSON.stringify(serializedValue)}]`
    })
    .join(",")

  return `globalThis[Symbol.for("${store.id}")] = new Map([${map_data}]);`
}

export function deserialize(store: Store, map: Map<string, State<any>>, scope: Record<symbol, any> = globalThis) {
  const registry = getTokenRegistry(store)
  const serializedData = scope[Symbol.for(store.id)]

  for (const [id, token] of map) {
    const deserialized: SerializedValue = serializedData?.get(id)
    if (deserialized) {
      registry.registerState(token, deserialized.v)
      if (token instanceof Container && deserialized.mv !== undefined) {
        registry.registerState(token.meta, deserialized.mv)
      }
    }
  }
}