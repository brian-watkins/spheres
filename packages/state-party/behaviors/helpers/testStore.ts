import { Selection, Container, Provider, State, Store, Writer, store, write, StoreArg, StoreMessage, batch, GetState, QueryHandle, StoreQuery } from "@src/index.js"
import { Context } from "esbehavior"

export function testStoreContext<T>(): Context<TestStore<T>> {
  return {
    init: () => new TestStore<T>()
  }
}

class StoreValuesQuery implements StoreQuery {
  values: Array<any> = []

  constructor(private definition: (get: GetState) => any) { }

  run(get: GetState): void {
    this.values.push(this.definition(get))
  }
}

export class TestStore<T> {
  public store: Store
  private _tokens: T | undefined
  private values: Map<string, StoreValuesQuery> = new Map()
  private queries: Map<string, QueryHandle> = new Map()

  constructor() {
    this.store = new Store()
  }

  queryStore(definition: (get: GetState) => any, name: string) {
    const query = new StoreValuesQuery(definition)
    this.values.set(name, query)
    const unsubscribe = this.store.useQuery(query)
    this.queries.set(name, unsubscribe)
  }

  subscribeTo<S, N>(token: State<S, N>, name: string) {
    const query = new StoreValuesQuery((get) => get(token))
    this.values.set(name, query)
    const unsubscribe = this.store.useQuery(query)
    this.queries.set(name, unsubscribe)
  }

  unsubscribe(name: string) {
    this.queries.get(name)?.unsubscribe()
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
    return this.values.get(name)?.values!
  }

  setTokens(tokens: T) {
    this._tokens = tokens
  }

  get tokens(): T {
    return this._tokens!
  }
}
