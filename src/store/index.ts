
export interface PendingMessage<M> {
  type: "pending"
  message: M
}

export interface OkMessage<M> {
  type: "ok"
  message: M
}

export interface ErrorMessage<M> {
  type: "error"
  message: M
}

export interface InitMessage<T> {
  type: "initialValue"
  value: T
}

export type Meta<T, M = T> = InitMessage<T> | PendingMessage<M> | OkMessage<M> | ErrorMessage<M>

function init<T>(value: T): InitMessage<T> {
  return {
    type: "initialValue",
    value
  }
}

export function ok<M>(message: M): OkMessage<M> {
  return {
    type: "ok",
    message
  }
}

export function pending<M>(message: M): PendingMessage<M> {
  return {
    type: "pending",
    message
  }
}

export function error<M>(message: M): ErrorMessage<M> {
  return {
    type: "error",
    message
  }
}

export type GetState = <S, N>(state: State<S, N>) => S

export interface Provider {
  provide(get: <S, N>(state: State<S, N>) => S, set: <Q, M>(state: State<Meta<Q, M>>, value: Meta<Q, M>) => void): void
}

export interface Writer<M> {
  write(message: M, get: <S, N>(state: State<S, N>) => S, set: (value: Meta<M>) => void): void
}

export interface Rule<ContainerMessage, RuleArgument = undefined> {
  readonly container: Container<any, ContainerMessage>
  readonly apply: (get: <S, N>(state: State<S, N>) => S, input: RuleArgument) => ContainerMessage
}

export function rule<M, Q = undefined>(container: Container<any, M>, definition: (get: <S, N>(state: State<S, N>) => S, inputValue: Q) => M): Rule<M, Q> {
  return {
    container,
    apply: definition
  }
}

export type TriggerInputArg<Q> = Q extends undefined ? [] : [Q]

export interface TriggerMessage<M> {
  type: "trigger"
  rule: Rule<M, any>
  input: any
}

export function trigger<M, Q>(rule: Rule<M, Q>, ...input: TriggerInputArg<Q>): TriggerMessage<M> {
  return {
    type: "trigger",
    rule,
    input: input.length === 0 ? undefined : input[0]
  }
}

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

export class MetaState<T, M> extends State<Meta<T, M>> {
  constructor(private token: State<T, M>) {
    super()
  }

  [registerState](getOrCreate: <S, N>(state: State<S, N>) => ContainerController<S, N>): ContainerController<Meta<T, M>> {
    const tokenController = getOrCreate(this.token)

    const controller = new ContainerController<Meta<T, M>>(init(tokenController.value), (val) => val)
    controller.addDependent((value) => {
      if (value.type === "ok") {
        tokenController.updateValue(value.message)
      }
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

interface ContainerInitializer<T, M = T> {
  initialValue: T,
  reducer: (message: M, current: T) => T
}

export function withInitialValue<T>(value: T): ContainerInitializer<T> {
  return {
    initialValue: value,
    reducer: (val) => val
  }
}

export function withReducer<T, M>(initialValue: T, reducer: (message: M, current: T) => T): ContainerInitializer<T, M> {
  return {
    initialValue,
    reducer
  }
}

export function container<T, M = T>(initializer: ContainerInitializer<T, M>): Container<T, M> {
  return new Container(initializer.initialValue, initializer.reducer)
}

export function derived<T>(derivation: (get: GetState) => T): DerivedState<T> {
  return new DerivedState(derivation)
}

export interface WriteMessage<T, M> {
  type: "write"
  token: Container<T, M>
  value: M
}

export function write<T, M = T>(container: Container<T, M>, value: M): WriteMessage<T, M> {
  return {
    type: "write",
    token: container,
    value
  }
} 

export type StoreMessage<T, M = T> = WriteMessage<T, M> | TriggerMessage<M>

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

  subscribe<T, M>(token: State<T, M>, update: (value: T) => void): () => void {
    if (!this.registry.has(token)) {
      this.createState(token)
    }

    return this.registry.get(token)!.addSubscriber(update)
  }

  useProvider(provider: Provider) {
    const queryDependencies = new Set<State<any>>()

    const set = <Q, M>(state: State<Meta<Q, M>>, value: Meta<Q, M>) => {
      if (!this.registry.has(state)) {
        this.createState(state)
      }

      this.registry.get(state)?.updateValue(value)
    }

    const get = <S, N>(state: State<S, N>) => {
      if (!queryDependencies.has(state)) {
        queryDependencies.add(state)
        if (!this.registry.has(state)) {
          this.createState(state)
        }

        this.registry.get(state)?.addDependent(() => provider.provide(get, set))
      }

      return this.registry.get(state)?.value
    }

    provider.provide(get, set)
  }

  useWriter<T, M>(token: State<T, M>, writer: Writer<M>) {
    if (!this.registry.has(token)) {
      this.createState(token)
    }

    this.registry.get(token)?.setWriter((value) => {
      writer.write(value, (state) => {
        if (!this.registry.has(state)) {
          this.createState(state)
        }
        return this.registry.get(state)?.value
      }, (value) => {
        if (!this.registry.has(token.meta)) {
          this.createState(token.meta)
        }
        this.registry.get(token.meta)?.updateValue(value)
      })
    })
  }

  dispatch<T, M>(message: StoreMessage<T, M>) {
    switch (message.type) {
      case "write":
        // Note: what if the token does not exist yet?
        this.registry.get(message.token)?.writeValue(message.value)
        break
      case "trigger":
        const result = message.rule.apply((state) => {
          if (!this.registry.has(state)) {
            this.createState(state)
          }
          return this.registry.get(state)?.value
        }, message.input)
        if (!this.registry.has(message.rule.container)) {
          this.createState(message.rule.container)
        }
        this.registry.get(message.rule.container)?.writeValue(result)
        break
    }
  }
}

class ContainerController<T, M = T> {
  private subscribers: Set<((value: T) => void)> = new Set()
  private dependents: Set<((value: T) => void)> = new Set()
  private writer: (value: M) => void

  constructor(private _value: T, private update: (message: M, current: T) => T) {
    this.writer = (value) => this.updateValue(value)
  }

  setWriter(writer: (value: M) => void) {
    this.writer = writer
  }

  addDependent(notifier: (value: T) => void) {
    this.dependents.add(notifier)
  }

  addSubscriber(notify: (value: T) => void): () => void {
    notify(this._value)
    this.subscribers.add(notify)

    return () => {
      this.subscribers.delete(notify)
    }
  }

  updateValue(value: M) {
    this._value = this.update(value, this._value)
    this.dependents.forEach(notify => notify(this._value))
    this.subscribers.forEach(notify => notify(this._value))
  }

  writeValue(value: M) {
    this.writer(value)
  }

  get value(): T {
    return this._value
  }
}