import { Meta, Provider, State } from "@src/loop.js";

export class TestProvider<Q> implements Provider {
  resolver: ((value: Q) => void) | undefined
  handler: ((get: <S>(state: State<S>) => S, set: (state: State<Meta<Q>>, value: Meta<Q>) => void, waitFor: () => Promise<Q>) => Promise<void>) | undefined

  setHandler(handler: (get: <S>(state: State<S>) => S, set: (state: State<Meta<Q>>, value: Meta<Q>) => void, waitFor: () => Promise<Q>) => Promise<void>) {
    this.handler = handler
  }

  async provide(get: <S>(state: State<S>) => S, set: (state: State<Meta<Q>>, value: Meta<Q>) => void): Promise<void> {
    this.handler?.(get, set, () => {
      return new Promise<Q>((resolve) => {
        this.resolver = resolve
      })
    })
  }
}
