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
  current(): T
}

export interface Writer<T, M = T> {
  write(message: M, actions: WriterActions<T, M>): void
}

export interface RuleActions<T> {
  get: GetState,
  current: T
}

export interface Rule<ContainerValue, ContainerMessage, RuleArgument = undefined> {
  readonly container: Container<ContainerValue, ContainerMessage>
  readonly apply: (actions: RuleActions<ContainerValue>, input: RuleArgument) => ContainerMessage
}

export interface WriteMessage<T, M> {
  type: "write"
  token: Container<T, M>
  value: M
}

export interface TriggerMessage<T, M> {
  type: "trigger"
  rule: Rule<T, M, any>
  input: any
}

export type StoreMessage<T, M = T> = WriteMessage<T, M> | TriggerMessage<T, M>

const registerState = Symbol("registerState")

export abstract class State<T, M = T> {
  private _meta: MetaState<T, M> | undefined
  private static StateId = 0
  private _id = State.StateId++

  abstract [registerState](getOrCreate: <S, N>(state: State<S, N>) => ContainerController<S, N>): ContainerController<T, M>

  get meta(): MetaState<T, M> {
    if (!this._meta) {
      this._meta = new MetaState(this)
    }
    return this._meta
  }

  toString() {
    return `State-${this._id}`
  }
}

export class MetaState<T, M> extends State<Meta<M>> {
  constructor(private token: State<T, M>) {
    super()
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

export class Container<T, M = T> extends State<T, M> {
  constructor(private initialValue: T, private update: (message: M, current: T) => T) {
    super()
  }

  [registerState](_: <S, N>(state: State<S, N>) => ContainerController<S, N>): ContainerController<T, M> {
    return new ContainerController(this.initialValue, this.update)
  }
}

export class DerivedState<T> extends State<T> {
  constructor(private derivation: (get: GetState) => T) {
    super()
  }

  [registerState](getOrCreate: <S, N>(state: State<S, N>) => ContainerController<S, N>): ContainerController<T, T> {
    let dependencies: Set<State<any>> = new Set()

    const get = <S, N>(state: State<S, N>) => {
      if (!dependencies.has(state)) {
        dependencies.add(state)
        const controller = getOrCreate(state)
        controller.addDependent(() => {
          getOrCreate(this)?.updateValue(this.derivation(get))
        })
      }
      return getOrCreate(state).value
    }

    return new ContainerController(this.derivation(get), (val) => val)
  }
}

export class Store {
  private registry: WeakMap<State<any>, ContainerController<any, any>> = new WeakMap()

  private createState<T, M>(token: State<T, M>) {
    const getOrCreateToken = <S, N>(stateToken: State<S, N>) => {
      if (!this.registry.has(stateToken)) {
        const controller = stateToken[registerState](getOrCreateToken)
        this.registry.set(stateToken, controller)
      }
      return this.registry.get(stateToken)!
    }

    const controller = token[registerState](getOrCreateToken)
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

  useProvider(provider: Provider) {
    const queryDependencies = new Set<State<any>>()

    const set = <Q, M>(state: State<Q, M>, value: M) => {
      this.getController(state).updateValue(value)
    }

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
          controller.updateValue(value)
        },
        pending: (message) => {
          this.getController(token.meta).updateValue(pending(message))
        },
        error: (message) => {
          this.getController(token.meta).updateValue(error(message))
        },
        current: () => {
          return controller.value
        }
      })
    })
  }

  dispatch<T, M>(message: StoreMessage<T, M>) {
    switch (message.type) {
      case "write":
        this.getController(message.token).writeValue(message.value)
        break
      case "trigger":
        const controller = this.getController(message.rule.container)
        const result = message.rule.apply({
          get: (state) => {
            return this.getController(state).value
          },
          current: controller.value
        }, message.input)
        controller.writeValue(result)
        break
    }
  }
}
