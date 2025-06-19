import { Container, State, Store, write, StoreMessage, batch, GetState, reset, Command, CommandActions, ContainerHooks, ReactiveEffect, createStore, useContainerHooks, useEffect, useCommand, InitializerActions } from "@store/index.js"
import { Context } from "best-behavior"

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
      initializer
    })

    return this.store.initialized
  }

  registerEffect(name: string, definition: (get: GetState) => any) {
    const effect = new StoreValuesEffect(definition)
    this.values.set(name, effect)
    useEffect(this.store, effect)
  }

  subscribeTo<S>(token: State<S>, name: string) {
    const query = new StoreValuesEffect((get) => get(token))
    this.values.set(name, query)
    useEffect(this.store, query)
  }

  useCommand<M>(command: Command<M>, handler: (message: M, actions: CommandActions) => void) {
    useCommand(this.store, command, { exec: handler })
  }

  useContainerHooks<T, M>(token: Container<T, M>, hooks: ContainerHooks<T, M, any>) {
    useContainerHooks(this.store, token, hooks)
  }

  writeTo<S, M = S>(token: Container<S, M>, value: M) {
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
