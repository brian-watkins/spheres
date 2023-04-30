import { Container, Provider, StateToken, Store } from "@src/store"
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

  subscribeTo<S, N>(token: StateToken<S, N>, name: string) {
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
