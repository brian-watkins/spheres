import { Container, Provider, Rule, State, Store, TriggerInputArg, Writer, trigger } from "@src/store"
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

  triggerRule<T, M, A>(rule: Rule<T, M, A>, ...input: TriggerInputArg<A>) {
    this.store.dispatch(trigger(rule, ...input))
  }

  writeTo<S, M = S>(token: Container<S, M>, value: M) {
    this.store.dispatch({
      type: "write",
      token,
      value
    })
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
