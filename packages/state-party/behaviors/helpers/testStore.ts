import { Selection, Container, Provider, State, Store, Writer, store, write, StoreArg, StoreMessage, batch, GetState } from "@src/index.js"
import { Context } from "esbehavior"

export function testStoreContext<T>(): Context<TestStore<T>> {
  return {
    init: () => new TestStore<T>()
  }
}

export class TestStore<T> {
  private store: Store
  private _tokens: T | undefined
  private values: Map<string, Array<any>> = new Map()
  private unsubscribers: Map<string, () => void> = new Map()

  constructor() {
    this.store = new Store()
  }

  queryStore(query: (get: GetState) => any, name: string) {
    this.values.set(name, [])
    const unsubscribe = this.store.query(query, (updatedValue) => {
      this.values.get(name)?.push(updatedValue)
    })

    this.unsubscribers.set(name, unsubscribe)
  }

  subscribeTo<S, N>(token: State<S, N>, name: string) {
    this.values.set(name, [])
    const unsubscribe = this.store.subscribe(token, (updatedValue) => {
      this.values.get(name)?.push(updatedValue)
    })

    this.unsubscribers.set(name, unsubscribe)
  }

  unsubscribe(name: string) {
    this.unsubscribers.get(name)?.()
  }

  useProvider(provider: Provider) {
    this.store.useProvider(provider)
  }

  useWriter<T, M>(token: State<T, M>, writer: Writer<T, M>) {
    this.store.useWriter(token, writer)
  }

  storeSelection<A>(selection: Selection<A>, ...input: StoreArg<A>) {
    this.store.dispatch(store(selection, ...input))
  }

  writeTo<S, M = S>(token: Container<S, M>, value: M) {
    this.store.dispatch(write(token, value))
  }

  sendBatch(messages: Array<StoreMessage<any>>) {
    this.store.dispatch(batch(messages))
  }

  valuesForSubscriber(name: string): Array<any> {
    return this.values.get(name)!
  }

  setTokens(tokens: T) {
    this._tokens = tokens
  }

  get tokens(): T {
    return this._tokens!
  }
}
