import { Container, State, Store, write, StoreMessage, batch, GetState, reset, Command, CommandActions, ContainerHooks, ReactiveEffect, createStore, useContainerHooks, useEffect, useCommand, Collection, WritableState, StoreInitializerActions } from "@store/index.js"
import { initListener, StateEffect, StateListenerType } from "@store/tokenRegistry"
import { Context } from "best-behavior"
import { getTokenRegistry } from "@store/store"

export function testStoreContext<T>(): Context<TestStore<T>> {
  return {
    init: () => new TestStore<T>()
  }
}

interface ValuesStore {
  values: Array<any>
}

export class StoreValuesUserEffect implements ReactiveEffect, ValuesStore {
  values: Array<any> = []

  constructor(private definition: (get: GetState) => any) { }

  run(get: GetState): void {
    this.values.push(this.definition(get))
  }
}

export class StoreValuesElementEffect implements StateEffect, ValuesStore {
  readonly type = StateListenerType.ElementEffect
  values: Array<any> = []

  constructor(private definition: (get: GetState) => any) { }

  init(get: GetState): void {
    this.run(get)
  }

  run(get: GetState): void {
    this.values.push(this.definition(get))
  }
}


export class TestStore<T> {
  store: Store
  private _tokens: T | undefined
  private values: Map<string, ValuesStore> = new Map()

  constructor() {
    this.store = createStore()
  }

  initialize(initializer: (actions: StoreInitializerActions) => Promise<void>): Promise<void> {
    this.store = createStore({
      init: initializer
    })

    return this.store.initialized
  }

  registerEffect(name: string, definition: (get: GetState) => any) {
    const effect = new StoreValuesUserEffect(definition)
    this.values.set(name, effect)
    useEffect(this.store, effect)
  }

  registerSystemEffect(name: string, definition: (get: GetState) => any) {
    const effect = new StoreValuesElementEffect(definition)
    this.values.set(name, effect)
    initListener(getTokenRegistry(this.store), effect)
  }

  subscribeToCollection<K, S extends State<any>>(token: Collection<K, S>, id: K, name: string) {
    this.registerEffect(name, get => get(token.at(id)))
  }

  subscribeTo<S>(token: State<S>, name: string) {
    this.registerEffect(name, get => get(token))
  }

  subscribeSystemEffectTo<S>(token: State<S>, name: string) {
    this.registerSystemEffect(name, get => get(token))
  }

  useCommand<M>(command: Command<M>, handler: (message: M, actions: CommandActions) => void) {
    useCommand(this.store, command, { exec: handler })
  }

  useContainerHooks<T, M>(token: Container<T, M>, hooks: ContainerHooks<T, M, any>) {
    useContainerHooks(this.store, token, hooks)
  }

  writeToCollection<K, M, S extends Container<any>>(token: Collection<K, S>, id: K, message: M) {
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
