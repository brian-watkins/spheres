import { WritableState } from "@store/message"
import { Container, State, Store, write, StoreMessage, batch, GetState, reset, Command, CommandActions, ContainerHooks, ReactiveEffect, createStore, useContainerHooks, useEffect, useCommand, InitializerActions, Collection, Entity } from "@store/index.js"
import { Context } from "best-behavior"
import { StateReference } from "@store/tokenRegistry"

export function testStoreContext<T>(): Context<TestStore<T>> {
  return {
    init: () => new TestStore<T>()
  }
}

export class StoreValuesEffect implements ReactiveEffect {
  values: Array<any> = []

  constructor(private definition: (get: GetState) => any) { }

  run(get: GetState): void {
    this.values.push(this.definition(get))
  }
}

export class TestStore<T> {
  store: Store
  private _tokens: T | undefined
  private values: Map<string, StoreValuesEffect> = new Map()

  constructor() {
    this.store = createStore()
  }

  initialize(initializer: (actions: InitializerActions) => Promise<void>): Promise<void> {
    this.store = createStore({
      init: initializer
    })

    return this.store.initialized
  }

  registerEffect(name: string, definition: (get: GetState) => any) {
    const effect = new StoreValuesEffect(definition)
    this.values.set(name, effect)
    useEffect(this.store, effect)
  }

  subscribeToCollection<K, S, M>(token: Collection<K, S, M>, id: K, name: string) {
    const query = new StoreValuesEffect((get) => get(token.at(id)))
    this.values.set(name, query)
    useEffect(this.store, query)
  }

  subscribeTo<S>(token: StateReference<S>, name: string) {
    const query = new StoreValuesEffect((get) => {
      const val = get(token)
      console.log("Got val", val)
      return val
    })
    this.values.set(name, query)
    useEffect(this.store, query)
  }

  // subscribeToFlux<S>(token: State<S>, selector: (val: S) => Flux<any>, name: string) {
  //   // const query = new StoreValuesEffect((get) => get(selector(get(token))))
  //   const query = new StoreValuesEffect((get) => get(lens(token, selector)))
  //   this.values.set(name, query)
  //   useEffect(this.store, query)
  // }

  // subscribeToEntity<S>(lens: Lens<S>, name: string) {
  //   // const query = new StoreValuesEffect((get) => get(selector(get(entity))))
  //   const query = new StoreValuesEffect((get) => get(lens))
  //   this.values.set(name, query)
  //   useEffect(this.store, query)
  // }

  useCommand<M>(command: Command<M>, handler: (message: M, actions: CommandActions) => void) {
    useCommand(this.store, command, { exec: handler })
  }

  useContainerHooks<T, M>(token: Container<T, M>, hooks: ContainerHooks<T, M, any>) {
    useContainerHooks(this.store, token, hooks)
  }

  writeToCollection<K, S, M = S>(token: Collection<K, S, M>, id: K, message: M) {
    this.writeTo(token.at(id), message)
  }

  writeTo<S, M>(token: WritableState<S, M>, value: M) {
    this.store.dispatch(write(token, value))
  }

  sendBatch(messages: Array<StoreMessage>) {
    this.store.dispatch(batch(messages))
  }

  sendReset(container: Container<any>) {
    this.store.dispatch(reset(container))
  }

  valuesForSubscriber(name: string): Array<any> {
    return this.values.get(name)?.values!
  }

  setTokens(tokens: T) {
    this._tokens = tokens
  }

  get tokens(): T {
    return this._tokens!
  }
}
