
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

export interface Provider {
  provide(get: <S>(state: State<S>) => S, set: <Q>(state: State<Meta<Q>>, value: Meta<Q>) => void): void
}


// Note we use this to create a 'module private' function on the token
const derivation = Symbol("derivation")
const reducer = Symbol("reducer")

// export class MetaContainer<M> {

// }

export class Container<T, M = T> {
  private _meta: State<Meta<M>> | undefined

  constructor(private derivation: (get: <S>(token: State<S>) => S) => T, private update: (message: M, current: T) => T) { }

  get [derivation](): (get: <S>(token: State<S>) => S) => T {
    return this.derivation
  }

  get [reducer](): (message: M, current: T) => T {
    return this.update
  }

  get meta(): State<Meta<M>> {
    // this is totally unused but necessary to get the
    // types to compile ...
    if (!this._meta) {
      this._meta = state<Meta<M>>((get) => {
        const metaInitialValue: Meta<M> = {
          type: "ok",
          message: (this.derivation(get) as any)
        }
        return metaInitialValue
      })
    }

    return this._meta
  }
}

export class State<T> extends Container<T, T> {
  constructor(derivation: (get: <S>(token: State<S>) => S) => T) {
    super(derivation, (val) => val)
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
  return new Container(() => initializer.initialValue, initializer.reducer)
}

export function state<T>(derivation: (get: <S>(token: Container<S>) => S) => T): State<T> {
  return new State(derivation)
}

export interface WriteMessage<T, M> {
  type: "write"
  token: Container<T, M>
  value: M
}

export class Store {
  private registry: WeakMap<Container<any>, ContainerController<any>> = new WeakMap()

  subscribe<T, M>(token: Container<T, M>, update: (value: T) => void): () => void {
    if (!this.registry.has(token)) {
      let dependencies: Set<Container<any>> = new Set()

      const get = <S>(dependency: Container<S>): S => {
        if (!dependencies.has(dependency)) {
          dependencies.add(dependency)
          if (!this.registry.has(dependency)) {
            const initialValue = dependency[derivation](get)
            const controller = new ContainerController(initialValue, dependency[reducer])
            this.registry.set(dependency, controller)
            if (!this.registry.has(dependency.meta)) {
              const metaController = new ContainerController({ type: "ok", message: initialValue }, (val) => val)
              this.registry.set(dependency.meta, metaController)  
            }
            this.registry.get(dependency.meta)?.addDependent((value) => {
              if (value.type === "ok") {
                controller.writeValue(value.message)
              }
            })
          }
          this.registry.get(dependency)?.addDependent(() => {
            this.registry.get(token)?.writeValue(token[derivation](get))
          })
        }
        return this.registry.get(dependency)?.value
      }

      const initialValue = token[derivation](get)
      const controller = new ContainerController(initialValue, token[reducer])
      this.registry.set(token, controller)

      // create the meta container as well?
      if (!this.registry.has(token.meta)) {
        console.log("Creating meta on subscribe")
        const metaController = new ContainerController({ type: "ok", message: initialValue }, (val) => val)
        this.registry.set(token.meta, metaController)  
      } else {
        console.log("Not creating meta because it exists")
      }

      this.registry.get(token.meta)?.addDependent((value) => {
        if (value.type === "ok") {
          controller.writeValue(value.message)
        }
      })
    }

    return this.registry.get(token)!.addSubscriber(update)
  }

  useProvider(provider: Provider) {
    const queryDependencies = new Set<State<any>>()

    const set = <Q>(state: State<Meta<Q>>, value: Meta<Q>) => {
      // it doesn't have the meta value yet so we need to subscribe it
      // and here's where the derivation value might actually come in handy?
      if (!this.registry.has(state)) {
        // const initialValue = dependency[derivation](get)
        // const controller = new ContainerController(initialValue, dependency[reducer])
        // this.registry.set(dependency, controller)
        // what is get here though?
        console.log("Creating meta container!")
        const easyGet = <S>(s: State<S>) => {
          return this.registry.get(s)?.value
        }
        const metaController = new ContainerController(state[derivation](easyGet), state[reducer])
        this.registry.set(state, metaController)
      }

      this.registry.get(state)?.writeValue(value)
    }

    const get = <S>(state: State<S>) => {
      if (!queryDependencies.has(state)) {
        queryDependencies.add(state)
        // we have to add this thing if it doesn't exist
        this.registry.get(state)?.addDependent(() => provider.provide(get, set))
      }

      return this.registry.get(state)?.value
    }

    provider.provide(get, set)
  }

  dispatch<T, M>(message: WriteMessage<T, M>) {
    this.registry.get(message.token)?.writeValue(message.value)
  }
}

class ContainerController<S> {
  public subscribers: Set<((value: S) => void)> = new Set()
  public dependents: Set<((value: S) => void)> = new Set()

  constructor(private _value: S, private update: (message: any, current: S) => S) { }

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

  writeValue(value: S) {
    this._value = this.update(value, this._value)
    this.dependents.forEach(notify => notify(this._value))
    this.subscribers.forEach(notify => notify(this._value))
  }

  get value(): S {
    return this._value
  }
}