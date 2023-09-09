import { ContainerController } from "./controller.js"
import { StoreError } from "./error.js"
import { Meta, error, ok, pending } from "./meta.js"

export type GetState = <S, N = S>(state: State<S, N>) => S
export type Stateful<T> = (get: GetState) => T

export interface ProviderActions {
  get: GetState
  set: <Q, M>(state: State<Q, M>, value: M) => void
}

export interface Provider {
  provide(actions: ProviderActions): void
}

export interface WriterActions<T, M, E> {
  get: GetState
  ok(value: M): void
  pending(value: M): void
  error(value: M, reason: E): void
  current: T
}

export interface Writer<T, M = T, E = unknown> {
  write(message: M, actions: WriterActions<T, M, E>): Promise<void>
}

export interface QueryActions<T> {
  get: GetState,
  current: T
}

export interface SelectionActions<T> {
  get: GetState,
  current: T
}

export interface WriteMessage<T, M = T> {
  type: "write"
  container: Container<T, M>
  value: M
}

export interface Selection<SelectionArgument = undefined> {
  readonly query: (get: GetState, input: SelectionArgument) => StoreMessage<any>
}

export interface SelectMessage {
  type: "select"
  selection: Selection<any>
  input: any
}

export interface BatchMessage {
  type: "batch"
  messages: Array<StoreMessage<any>>
}

export type StoreMessage<T, M = T> = WriteMessage<T, M> | SelectMessage | BatchMessage

const registerState = Symbol("registerState")

let tokenId = 0

export abstract class State<T, M = T> {
  private name: string
  private _meta: MetaState<T, M, any> | undefined

  constructor(name: string | undefined) {
    this.name = name ?? `${tokenId++}`
  }

  abstract [registerState](getOrCreate: <S, N>(state: State<S, N>) => ContainerController<S, N>): ContainerController<T, M>

  get meta(): MetaState<T, M, any> {
    if (!this._meta) {
      this._meta = new MetaState(this)
    }
    return this._meta
  }

  toString() {
    return this.name
  }
}

export class MetaState<T, M, E = unknown> extends State<Meta<M, E>> {
  constructor(private token: State<T, M>) {
    super(`meta[${token.toString()}]`)
  }

  [registerState](getOrCreate: <S, N>(state: State<S, N>) => ContainerController<S, N>): ContainerController<Meta<M, E>> {
    const tokenController = getOrCreate(this.token)

    const controller = new ContainerController<Meta<M, E>>(ok(), (val) => val)

    tokenController.setMeta(controller)

    return controller
  }
}

export class Container<T, M = T> extends State<T, M> {
  constructor(
    name: string | undefined,
    private initialValue: T,
    private reducer: ((message: M, current: T) => T) | undefined,
    private query: ((actions: QueryActions<T>, nextValue?: M) => M) | undefined
  ) {
    super(name)
  }

  [registerState](getOrCreate: <S, N>(state: State<S, N>) => ContainerController<S, N>): ContainerController<T, M> {
    const containerController = new ContainerController(this.initialValue, this.reducer)

    if (!this.query) {
      return containerController
    }

    const queryDependencies = new WeakSet<State<any>>()

    const get = <S, N>(state: State<S, N>) => {
      const controller = getOrCreate(state)
      if (!queryDependencies.has(state)) {
        queryDependencies.add(state)
        controller.addDependent(() => {
          try {
            containerController.writeValue(this.query!({ get, current: containerController.value }))
          } catch (err) {
            getOrCreate(this.meta).writeValue(error(undefined, err))
          }
        })
      }

      return controller.value
    }

    containerController.setQuery((current, next) => {
      return this.query!({ get, current }, next)
    })

    try {
      containerController.writeValue(this.query({ get, current: this.initialValue }))
    } catch (err: any) {
      queueMicrotask(() => {
        getOrCreate(this.meta).writeValue(error(undefined, err))
      })
    }

    return containerController
  }
}

export class Value<T, M = T> extends State<T, M> {
  constructor(name: string | undefined, private derivation: (get: GetState, current: T | undefined) => M, private reducer: ((message: M, current: T | undefined) => T) | undefined) {
    super(name)
  }

  [registerState](getOrCreate: <S, N>(state: State<S, N>) => ContainerController<S, N>): ContainerController<T, M> {
    let dependencies = new WeakSet<State<any>>()

    const get = <S, N>(state: State<S, N>) => {
      const controller = getOrCreate(state)
      if (!dependencies.has(state)) {
        dependencies.add(state)
        controller.addDependent(() => {
          const derivedController = getOrCreate(this)
          try {
            derivedController.publishValue(this.derivation(get, derivedController.value))
          } catch (err) {
            getOrCreate(this.meta).writeValue(error(undefined, err))
          }
        })
      }
      return controller.value
    }

    let initialValue: T
    if (this.reducer) {
      initialValue = this.reducer(this.derivation(get, undefined), undefined)
    } else {
      try {
        initialValue = this.derivation(get, undefined) as unknown as T
      } catch (err) {
        const e = new StoreError(`Unable to initialize value: ${this.toString()}`)
        e.cause = err
        throw e
      }
    }

    return new ContainerController(initialValue, this.reducer)
  }
}

export class Store {
  private registry: WeakMap<State<any>, ContainerController<any, any>> = new WeakMap()

  private getController<T, M>(token: State<T, M>): ContainerController<T, M> {
    if (!this.registry.has(token)) {
      const controller = token[registerState]((state) => this.getController(state))
      this.registry.set(token, controller)
    }
    return this.registry.get(token)!
  }

  query(definition: (get: GetState) => void): () => void {
    let dependencies = new WeakSet<State<any>>()
    let unsubscribers: Array<() => void> = []

    const get = <S, N>(state: State<S, N>) => {
      const controller = this.getController(state)
      if (!dependencies.has(state)) {
        dependencies.add(state)
        const unsubscribe = controller.addDependent(() => {
          definition(get)
        })
        unsubscribers.push(unsubscribe)
      }
      return controller.value
    }

    definition(get)

    return () => {
      for (let i = 0; i < unsubscribers.length; i++) {
        unsubscribers[i]()
      }
      unsubscribers = []
    }
  }

  useProvider(provider: Provider) {
    const set = <Q, M>(state: State<Q, M>, value: M) => {
      this.getController(state).publishValue(value)
    }

    const queryDependencies = new WeakSet<State<any>>()
    const get = <S, N>(state: State<S, N>) => {
      const controller = this.getController(state)
      if (!queryDependencies.has(state)) {
        queryDependencies.add(state)
        controller.addDependent(() => provider.provide({ get, set }))
      }

      return controller.value
    }

    provider.provide({ get, set })
  }

  useWriter<T, M, E = unknown>(token: State<T, M>, writer: Writer<T, M, E>) {
    const controller = this.getController(token)

    controller.setWriter((value) => {
      writer.write(value, {
        get: (state) => {
          return this.getController(state).value
        },
        ok: (value) => {
          controller.publishValue(value)
        },
        pending: (message) => {
          this.getController(token.meta).publishValue(pending(message))
        },
        error: (message, reason) => {
          this.getController(token.meta).publishValue(error(message, reason))
        },
        current: controller.value
      }).catch((err) => {
        this.getController(token.meta).publishValue(error(value, err))
      })
    })
  }

  dispatch(message: StoreMessage<any>) {
    switch (message.type) {
      case "write":
        try {
          this.getController(message.container).updateValue(message.value)
        } catch (err) {
          this.getController(message.container.meta).writeValue(error(message.value, err))
        }
        break
      case "select":
        const get: GetState = (state) => this.getController(state).value
        const result = message.selection.query(get, message.input)
        this.dispatch(result)
        break
      case "batch":
        for (let i = 0; i < message.messages.length; i++) {
          this.dispatch(message.messages[i])
        }
        break
    }
  }
}
