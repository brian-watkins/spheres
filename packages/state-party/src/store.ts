import { ContainerController } from "./controller.js"
import { Meta, error, ok, pending } from "./meta.js"

export type GetState = <S, N>(state: State<S, N>) => S

export interface ProviderActions {
  get: GetState
  set: <Q, M>(state: State<Q, M>, value: M) => void
}

export interface Provider {
  provide(actions: ProviderActions): void
}

export interface WriterActions<T, M> {
  get: GetState
  ok(value: M): void
  pending(value: M): void
  error(value: M): void
  current: T
}

export interface Writer<T, M = T> {
  write(message: M, actions: WriterActions<T, M>): void
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

export abstract class State<T, M = T> {
  private _meta: MetaState<T, M> | undefined
  
  constructor(private name: string) { }

  abstract [registerState](getOrCreate: <S, N>(state: State<S, N>) => ContainerController<S, N>): ContainerController<T, M>

  get meta(): MetaState<T, M> {
    if (!this._meta) {
      this._meta = new MetaState(this)
    }
    return this._meta
  }

  toString() {
    return this.name
  }
}

export class MetaState<T, M> extends State<Meta<M>> {
  constructor(private token: State<T, M>) {
    super(`meta${token.toString()}`)
  }

  [registerState](getOrCreate: <S, N>(state: State<S, N>) => ContainerController<S, N>): ContainerController<Meta<M>> {
    const tokenController = getOrCreate(this.token)

    const controller = new ContainerController<Meta<M>>(ok(), (val) => val)
    tokenController.addDependent(() => {
      controller.writeValue(ok())
    })

    return controller
  }
}

let tokenIndex = 0

function uniqueName(name: string): string {
  return `[${name} ${tokenIndex++}]`
}

export class Container<T, M = T> extends State<T, M> {
  constructor(
    name: string,
    private initialValue: T,
    private reducer: ((message: M, current: T) => T) | undefined,
    private query: ((actions: QueryActions<T>, nextValue?: M) => M) | undefined
  ) {
    super(uniqueName(name))
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
          containerController.writeValue(this.query!({ get, current: containerController.value }))
        })
      }

      return controller.value
    }

    containerController.setQuery((current, next) => {
      return this.query!({ get, current }, next)
    })

    containerController.writeValue(this.query({ get, current: this.initialValue }))

    return containerController
  }
}

export class Value<T, M = T> extends State<T, M> {
  constructor(name: string, private derivation: (get: GetState, current: T | undefined) => M, private reducer: ((message: M, current: T | undefined) => T) | undefined) {
    super(uniqueName(name))
  }

  [registerState](getOrCreate: <S, N>(state: State<S, N>) => ContainerController<S, N>): ContainerController<T, M> {
    let dependencies = new WeakSet<State<any>>()

    const get = <S, N>(state: State<S, N>) => {
      const controller = getOrCreate(state)
      if (!dependencies.has(state)) {
        dependencies.add(state)
        controller.addDependent(() => {
          const derivedController = getOrCreate(this)
          derivedController.publishValue(this.derivation(get, derivedController.value))
        })
      }
      return controller.value
    }

    let initialValue: T
    if (this.reducer) {
      initialValue = this.reducer(this.derivation(get, undefined), undefined)
    } else {
      initialValue = this.derivation(get, undefined) as unknown as T
    }

    return new ContainerController(initialValue, this.reducer)
  }
}

export class Store {
  private registry: WeakMap<State<any>, ContainerController<any, any>> = new WeakMap()

  private createState<T, M>(token: State<T, M>) {
    const controller = token[registerState](this.getController.bind(this))
    this.registry.set(token, controller)
  }

  private getController<T, M>(token: State<T, M>): ContainerController<T, M> {
    if (!this.registry.has(token)) {
      this.createState(token)
    }
    return this.registry.get(token)!
  }

  subscribe<T, M>(token: State<T, M>, update: (value: T) => void): () => void {
    return this.getController(token).addSubscriber(update)
  }

  query<M>(definition: (get: GetState) => M, update: (value: M) => void): () => void {
    let dependencies = new WeakSet<State<any>>()
    let unsubscribers: Set<() => void> | undefined = new Set()

    const get = <S, N>(state: State<S, N>) => {
      const controller = this.getController(state)
      if (!dependencies.has(state)) {
        dependencies.add(state)
        const unsubscribe = controller.addDependent(() => {
          update(definition(get))
        })
        unsubscribers?.add(unsubscribe)
      }
      return controller.value
    }

    update(definition(get))

    return () => {
      unsubscribers?.forEach(unsubscribe => {
        unsubscribe()
      })
      unsubscribers?.clear()
      unsubscribers = undefined
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

  useWriter<T, M>(token: State<T, M>, writer: Writer<T, M>) {
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
        error: (message) => {
          this.getController(token.meta).publishValue(error(message))
        },
        current: controller.value
      })
    })
  }

  dispatch(message: StoreMessage<any>) {
    switch (message.type) {
      case "write":
        this.getController(message.container).updateValue(message.value)
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
