import { Container } from "./state/container.js"
import { dispatchMessage, StoreMessage } from "./message.js"
import { error, pending } from "./state/meta.js"
import { SerializableTokenRegistry } from "./store/serializableTokenRegistry.js"
import { StateWriter } from "./state/publisher/stateWriter.js"
import { Command, GetState, initializeCommand, initListener, State, StateListener, StateListenerVersion, StatePublisher, TokenRegistry } from "./tokenRegistry.js"
import { CommandManager, ManagedCommandController } from "./command/managedCommandController.js"

declare const globalThis: {
  [key: symbol]: any
} & Window

export function activateStore(id?: string): Store {
  return new Store({
    id,
    initialState: globalThis[Symbol.for(storeId(id))]
  })
}

export function createStore(id?: string): Store {
  return new Store({
    id
  })
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

export interface StoreHooks {
  onRegister(container: Container<any>): void
}

interface StoreOptions {
  id?: string
  initialState?: Map<string, any>
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

export class Store {
  private registry: SerializableTokenRegistry

  constructor(options: StoreOptions = {}) {
    this.registry = new SerializableTokenRegistry({ ...options, id: storeId(options.id) })
  }

  get [tokenRegistry](): TokenRegistry {
    return this.registry
  }

  dispatch(message: StoreMessage<any>) {
    dispatchMessage(this.registry, message)
  }

  useEffect(effect: ReactiveEffect): ReactiveEffectHandle {
    const listener = new EffectListener(this[tokenRegistry], effect)
    initListener(listener)
    return listener
  }

  useHooks(hooks: StoreHooks) {
    this.registry = new Proxy(this.registry, {
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
  }

  useCommand<M>(command: Command<M>, manager: CommandManager<M>) {
    const controller = new ManagedCommandController(this.registry, manager)
    this.registry.set(command, controller)
    command[initializeCommand](this.registry)
  }

  useContainerHooks<T, M, E>(container: Container<T, M>, hooks: ContainerHooks<T, M, E>) {
    const writerWithHooks = stateWriterWithHooks(this.registry, container, this.registry.get<StateWriter<any>>(container), hooks)
    this.registry.set(container, writerWithHooks)

    if (hooks.onReady !== undefined) {
      hooks.onReady(containerReadyActions(this.registry, container, writerWithHooks))
    }
  }

  serialize(): string {
    return this.registry.serialize()
  }
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

function containerReadyActions<T, M, E>(registry: TokenRegistry, container: Container<T, M>, writer: StateWriter<T>): ReadyHookActions<T, M, E> {
  return {
    get: (state) => {
      return registry.get<StatePublisher<any>>(state).getValue()
    },
    supply: (value) => {
      writer.publish(value)
    },
    pending: (message) => {
      registry.get<StateWriter<any>>(container.meta).publish(pending(message))
    },
    error: (message, reason) => {
      registry.get<StateWriter<any>>(container.meta).publish(error(message, reason))
    },
    current: writer.getValue()
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
    error: (message, reason) => {
      registry.get<StateWriter<any>>(container.meta).write(error(message, reason))
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
