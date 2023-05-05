// import { Meta, Provider, State } from "@src/loop.js";

import { Meta, Provider, State } from "@src/store"

export class TestProvider<Q, M = Q> implements Provider {
  resolver: ((value: M) => void) | undefined
  handler: ((get: <S, N>(state: State<S, N>) => S, set: (state: State<Meta<Q, M>>, value: Meta<Q, M>) => void, waitFor: () => Promise<M>) => Promise<void>) | undefined

  setHandler(handler: (get: <S, N>(state: State<S, N>) => S, set: (state: State<Meta<Q, M>>, value: Meta<Q, M>) => void, waitFor: () => Promise<M>) => Promise<void>) {
    this.handler = handler
  }

  async provide(get: <S, N>(state: State<S, N>) => S, set: (state: State<Meta<Q, M>>, value: Meta<Q, M>) => void): Promise<void> {
    this.handler?.(get, set, () => {
      return new Promise<M>((resolve) => {
        this.resolver = resolve
      })
    })
  }
}
