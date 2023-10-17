import { Provider, ProviderActions, State } from "@src/index.js"

export class TestProvider implements Provider {
  resolver: ((value: any) => void) | undefined
  handler: ((get: <S, N>(state: State<S, N>) => S, set: <Q, M>(state: State<Q, M>, value: M) => void, waitFor: () => Promise<any>) => Promise<void>) | undefined

  setHandler(handler: (get: <S, N>(state: State<S, N>) => S, set: <Q, M>(state: State<Q, M>, value: M) => void, waitFor: () => Promise<any>) => Promise<void>) {
    this.handler = handler
  }

  async provide({ get, set }: ProviderActions): Promise<void> {
    this.handler?.(get, set, () => {
      return new Promise<any>((resolve) => {
        this.resolver = resolve
      })
    })
  }
}
