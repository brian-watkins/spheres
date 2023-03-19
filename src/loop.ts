export interface State<T> {
  subscribe(notify: (updatedState: T) => void): () => void
}

export interface Container<T, M = T> extends State<T> {
  _containerBrand: any | M
}

export interface Provider {
  provide(get: <S>(state: State<S>) => S, set: <Q>(state: State<Meta<Q>>, value: Meta<Q>) => void): void
}

export interface Writer<M> {
  write(message: M, get: <S>(state: State<S>) => S, set: (value: Meta<M>) => void): void
}

export interface Rule<ContainerMessage, RuleArgument = undefined> {
  readonly container: Container<any, ContainerMessage>
  readonly apply: (get: <S>(state: State<S>) => S, input: RuleArgument) => ContainerMessage
}

export interface WriteValueMessage<T, M = T> {
  type: "write"
  value: M
  container: Container<T, M>
}

export interface TriggerRuleMessage<M> {
  type: "trigger"
  rule: Rule<M, any>
  input: any
}

export type LoopMessage<T, M = T> = WriteValueMessage<T, M> | TriggerRuleMessage<M>

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

export type Meta<M> = PendingMessage<M> | OkMessage<M> | ErrorMessage<M>

export class Loop {
  private registry = new WeakMap<State<any>, ContainerController<any>>()

  registerProvider(provider: Provider) {
    const queryDependencies = new Set<State<any>>()

    const set = <Q>(state: State<Meta<Q>>, value: Meta<Q>) => {
      this.registry.get(state)?.updateValue(value)
    }

    const get = <S>(state: State<S>) => {
      if (!queryDependencies.has(state)) {
        queryDependencies.add(state)
        this.registry.get(state)?.addDependent(() => provider.provide(get, set))
      }

      return this.registry.get(state)?.value
    }

    provider.provide(get, set)
  }

  registerWriter<T, M>(container: Container<T, M>, writer: Writer<M>) {
    const controller = this.registry.get(container)
    if (controller) {
      controller.setWriter((value) => {
        writer.write(value, (state) => this.registry.get(state)?.value, (value) => {
          if (controller.metaContainer) {
            this.registry.get(controller.metaContainer)?.updateValue(value)
          } else if (value.type === "ok") {
            controller.updateValue(value.message)
          }
        })
      })
    }
  }

  fetchMetaContainer<T, M>(state: Container<T, M> | State<M>): State<Meta<M>> {
    const containerController = this.registry.get(state)!

    if (!containerController.metaContainer) {
      const initialMetaState = ok(containerController.value)

      containerController.metaContainer = this.createContainer<Meta<M>>(initialMetaState, (val) => val)

      const metaController: ContainerController<Meta<M>> = this.registry.get(containerController.metaContainer)!

      metaController.addDependent((signal) => {
        if (signal.type === "ok") {
          containerController.updateValue(signal.message)
        }
      })
    }

    return containerController.metaContainer
  }

  createContainer<T, M = T>(initialState: T, update: (message: M, current: T) => T): Container<T, M> {
    const controller = new ContainerController(initialState, update)
    const container = new BasicContainer<T>(controller)

    this.registry.set(container, controller)

    return container
  }

  deriveContainer<T>(derivation: (get: <S>(state: State<S>) => S) => T): Container<T> {
    let dependencies: Set<State<any>> = new Set()

    let container: Container<T>

    const get = <P>(state: State<P>): P => {
      if (!dependencies.has(state)) {
        dependencies.add(state)
        this.registry.get(state)?.addDependent(() => {
          this.registry.get(container)?.updateValue(derivation(get))
        })
      }
      return this.registry.get(state)?.value
    }

    container = this.createContainer(derivation(get), (val) => val)

    return container
  }

  dispatch<T, M>(message: LoopMessage<T, M>) {
    switch (message.type) {
      case "write":
        this.registry.get(message.container)?.writeValue(message.value)
        break
      case "trigger":
        const result = message.rule.apply((state) => this.registry.get(state)?.value, message.input)
        this.registry.get(message.rule.container)?.writeValue(result)
        break
    }
  }

  reset() {
    this.registry = new WeakMap<State<any>, ContainerController<any>>()
  }
}

class ContainerController<S> {
  private writer = (value: S) => this.updateValue(value)
  private dependents = new Set<(value: S) => void>()
  public subscribers: Set<((value: S) => void)> = new Set()
  public metaContainer: State<Meta<S>> | undefined

  constructor(private _value: S, private update: (message: any, current: S) => S) { }

  setWriter(writer: (value: S) => void) {
    this.writer = writer
  }

  addDependent(notifier: (value: S) => void) {
    this.dependents.add(notifier)
  }

  addSubscriber(notify: (value: S) => void): () => void {
    notify(this._value)
    this.subscribers.add(notify)

    return () => {
      this.subscribers.delete(notify)
    }
  }

  get value(): S {
    return this._value
  }

  updateValue(value: S) {
    this._value = this.update(value, this._value)
    this.dependents.forEach(notify => notify(this._value))
    this.subscribers.forEach(notify => notify(this._value))
  }

  writeValue(value: S) {
    this.writer(value)
  }
}

class BasicContainer<T> implements Container<T> {
  private static _id = 0
  private _internalId: number
  _containerBrand: any

  constructor(private controller: ContainerController<T>) {
    this._internalId = BasicContainer._id++
  }

  subscribe(notify: (updatedState: T) => void): () => void {
    return this.controller.addSubscriber(notify)
  }

  toString(): string {
    return `state-${this._internalId}`
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