import { Rule, Container, Provider, State, Store, Writer, write, RuleArg, StoreMessage, batch, GetState, Effect, use } from "@src/index.js"
import { Context } from "esbehavior"

export function testStoreContext<T>(): Context<TestStore<T>> {
  return {
    init: () => new TestStore<T>()
  }
}

class StoreValuesEffect implements Effect {
  values: Array<any> = []

  constructor(private definition: (get: GetState) => any) { }

  run(get: GetState): void {
    this.values.push(this.definition(get))
  }
}

export class TestStore<T> {
  public store: Store
  private _tokens: T | undefined
  private values: Map<string, StoreValuesEffect> = new Map()

  constructor() {
    this.store = new Store()
  }

  registerEffect(definition: (get: GetState) => any, name: string) {
    const effect = new StoreValuesEffect(definition)
    this.values.set(name, effect)
    this.store.useEffect(effect)
  }

  subscribeTo<S, N>(token: State<S, N>, name: string) {
    const query = new StoreValuesEffect((get) => get(token))
    this.values.set(name, query)
    this.store.useEffect(query)
  }

  useProvider(provider: Provider) {
    this.store.useProvider(provider)
  }

  useWriter<T, M>(token: State<T, M>, writer: Writer<T, M>) {
    this.store.useWriter(token, writer)
  }

  useRule<A>(rule: Rule<A>, ...input: RuleArg<A>) {
    this.store.dispatch(use(rule, ...input))
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
