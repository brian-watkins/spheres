
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

export interface Provider {
  provide(get: <S, N>(state: StateToken<S, N>) => S, set: <Q, M>(state: StateToken<Meta<Q, M>>, value: Meta<Q, M>) => void): void
}


// Note we use this to create a 'module private' function on the token
// const derivation = Symbol("derivation")
// const reducer = Symbol("reducer")
const registerState = Symbol("registerState")

// export class MetaContainer<M> {

// }

// I could try to make subclasses of container and
// pull the logic for initializing into the subclasses?
// So there would be one for derived state, meta state, and normal state
// We'd need a 'register' function that takes the registry and that's it I think
// or maybe a function that gets or creates a container and then this function
// returns the new container controller

export abstract class StateToken<T, M = T> {
  private _meta: MetaState<T, M> | undefined

  abstract [registerState](getOrCreate: <S, N>(state: StateToken<S, N>) => ContainerController<S, N>): ContainerController<T, M>

  get meta(): MetaState<T, M> {
    if (!this._meta) {
      this._meta = new MetaState(this)
    }
    return this._meta
  }
}

// For a meta state of a container with a reducer ...
// It's like the initial state is the actual value of the container in ok form
// but then when you write to the container, you should send it the reducer
// messages. BUT the purpose of the meta container is to send a message to
// the container. So that means the output of the MetaState needs to match
// the input of the Container state. But then you are saying the T must equal M.
// So seems like the output of the meta state should be Meta<M> but then
// the initial state of the meta state cannot be Meta<T> because that initial
// value is what will get sent to subscribers.

// Maybe the point is this ... for a container with a reducer, the initial
// value must be a MESSAGE -- ie of M type -- not an actual value of T type ...
// or there's some default message called _init or something?

export class MetaState<T, M> extends StateToken<Meta<T, M>> {
  constructor(private token: StateToken<T, M>) {
    super()
  }

  [registerState](getOrCreate: <S, N>(state: StateToken<S, N>) => ContainerController<S, N>): ContainerController<Meta<T, M>> {
    const tokenController = getOrCreate(this.token)

    const controller = new ContainerController<Meta<T, M>>(init(tokenController.value), (val) => val)
    controller.addDependent((value) => {
      if (value.type === "ok") {
        tokenController.writeValue(value.message)
      }
    })

    return controller
  }
}

export class Container<T, M = T> extends StateToken<T, M> {
  constructor(private initialValue: T, private update: (message: M, current: T) => T) {
    super()
  }

  [registerState](_: <S, N>(state: StateToken<S, N>) => ContainerController<S, N>): ContainerController<T, M> {
    return new ContainerController(this.initialValue, this.update)
  }
}

export class DerivedState<T> extends StateToken<T> {
  constructor(private derivation: (get: <S>(token: StateToken<S>) => S) => T) {
    super()
  }

  [registerState](getOrCreate: <S, N>(state: StateToken<S, N>) => ContainerController<S, N>): ContainerController<T, T> {
    // let derivedStateController: ContainerController<any>
    let dependencies: Set<StateToken<any>> = new Set()

    const get = <S>(state: StateToken<S>) => {
      if (!dependencies.has(state)) {
        dependencies.add(state)
        const controller = getOrCreate(state)
        controller.addDependent(() => {
          getOrCreate(this)?.writeValue(this.derivation(get))
          // derivedStateController.writeValue(this.derivation(get))
        })
      }
      return getOrCreate(state).value
    }

    return new ContainerController(this.derivation(get), (val) => val)
    // return derivedStateController
  }
}

// export class Container<T, M = T> {
//   private _meta: State<Meta<M>> | undefined

//   constructor(private derivation: (get: <S>(token: State<S>) => S) => T, private update: (message: M, current: T) => T) { }

//   get [derivation](): (get: <S>(token: State<S>) => S) => T {
//     return this.derivation
//   }

//   get [reducer](): (message: M, current: T) => T {
//     return this.update
//   }

//   get meta(): State<Meta<M>> {
//     // this is totally unused but necessary to get the
//     // types to compile ...
//     if (!this._meta) {
//       this._meta = state<Meta<M>>((get) => {
//         const metaInitialValue: Meta<M> = {
//           type: "ok",
//           message: (this.derivation(get) as any)
//         }
//         return metaInitialValue
//       })
//     }

//     return this._meta
//   }
// }

// export class State<T> extends Container<T, T> {
//   constructor(derivation: (get: <S>(token: State<S>) => S) => T) {
//     super(derivation, (val) => val)
//   }
// }

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

export function state<T>(derivation: (get: <S>(token: StateToken<S>) => S) => T): DerivedState<T> {
  return new DerivedState(derivation)
}

export interface WriteMessage<T, M> {
  type: "write"
  token: Container<T, M>
  value: M
}

export class Store {
  private registry: WeakMap<StateToken<any>, ContainerController<any, any>> = new WeakMap()

  private createState<T, M>(token: StateToken<T, M>) {
    const getOrCreateToken = <S, N>(stateToken: StateToken<S, N>) => {
      if (!this.registry.has(stateToken)) {
        const controller = stateToken[registerState](getOrCreateToken)
        this.registry.set(stateToken, controller)              
      }
      return this.registry.get(stateToken)!
    }
    
    const controller = token[registerState](getOrCreateToken)
    this.registry.set(token, controller)
  }

  subscribe<T, M>(token: StateToken<T, M>, update: (value: T) => void): () => void {
    if (!this.registry.has(token)) {
      this.createState(token)

      // let dependencies: Set<Container<any>> = new Set()

      // const get = <S>(dependency: Container<S>): S => {
      //   if (!dependencies.has(dependency)) {
      //     dependencies.add(dependency)
      //     if (!this.registry.has(dependency)) {
      //       const initialValue = dependency[derivation](get)
      //       const controller = new ContainerController(initialValue, dependency[reducer])
      //       this.registry.set(dependency, controller)
      //       if (!this.registry.has(dependency.meta)) {
      //         const metaController = new ContainerController({ type: "ok", message: initialValue }, (val) => val)
      //         this.registry.set(dependency.meta, metaController)  
      //       }
      //       this.registry.get(dependency.meta)?.addDependent((value) => {
      //         if (value.type === "ok") {
      //           controller.writeValue(value.message)
      //         }
      //       })
      //     }
      //     this.registry.get(dependency)?.addDependent(() => {
      //       this.registry.get(token)?.writeValue(token[derivation](get))
      //     })
      //   }
      //   return this.registry.get(dependency)?.value
      // }

      // const initialValue = token[derivation](get)
      // const controller = new ContainerController(initialValue, token[reducer])
      // this.registry.set(token, controller)

      // // create the meta container as well?
      // if (!this.registry.has(token.meta)) {
      //   console.log("Creating meta on subscribe")
      //   const metaController = new ContainerController({ type: "ok", message: initialValue }, (val) => val)
      //   this.registry.set(token.meta, metaController)  
      // } else {
      //   console.log("Not creating meta because it exists")
      // }

      // this.registry.get(token.meta)?.addDependent((value) => {
      //   if (value.type === "ok") {
      //     controller.writeValue(value.message)
      //   }
      // })
    }

    return this.registry.get(token)!.addSubscriber(update)
  }

  useProvider(provider: Provider) {
    const queryDependencies = new Set<StateToken<any>>()

    const set = <Q, M>(state: StateToken<Meta<Q, M>>, value: Meta<Q, M>) => {
      // it doesn't have the meta value yet so we need to subscribe it
      // and here's where the derivation value might actually come in handy?
      if (!this.registry.has(state)) {
        this.createState(state)
        // const initialValue = dependency[derivation](get)
        // const controller = new ContainerController(initialValue, dependency[reducer])
        // this.registry.set(dependency, controller)
        // what is get here though?
        // console.log("Creating meta container!")
        // const easyGet = <S>(s: StateToken<S>) => {
          // return this.registry.get(s)?.value
        // }
        // const metaController = new ContainerController(state[derivation](easyGet), state[reducer])
        // this.registry.set(state, metaController)
      }

      this.registry.get(state)?.writeValue(value)
    }

    const get = <S, N>(state: StateToken<S, N>) => {
      if (!queryDependencies.has(state)) {
        queryDependencies.add(state)
        // we have to add this thing if it doesn't exist
        if (!this.registry.has(state)) {
          this.createState(state)
        }

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

class ContainerController<T, M = T> {
  public subscribers: Set<((value: T) => void)> = new Set()
  public dependents: Set<((value: T) => void)> = new Set()

  constructor(private _value: T, private update: (message: M, current: T) => T) { }

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

  writeValue(value: M) {
    this._value = this.update(value, this._value)
    this.dependents.forEach(notify => notify(this._value))
    this.subscribers.forEach(notify => notify(this._value))
  }

  get value(): T {
    return this._value
  }
}