import { Provider, State } from "../../src/loop";

interface TestUnknownState {
  type: "unknown"
}

interface TestLoadingState {
  type: "loading"
  key?: any
}

interface TestLoadedState<S> {
  type: "loaded"
  value: S
}

export type TestProvidedState<S> = TestUnknownState | TestLoadingState | TestLoadedState<S>

export class TestProvider<Q> implements Provider {
  resolver: ((value: Q) => void) | undefined
  handler: ((get: <S>(state: State<S>) => S, set: (state: State<TestProvidedState<Q>>, value: TestProvidedState<Q>) => void, waitFor: () => Promise<Q>) => Promise<void>) | undefined

  setHandler(handler: (get: <S>(state: State<S>) => S, set: (state: State<TestProvidedState<Q>>, value: TestProvidedState<Q>) => void, waitFor: () => Promise<Q>) => Promise<void>) {
    this.handler = handler
  }

  async provide(get: <S>(state: State<S>) => S, set: (state: State<TestProvidedState<Q>>, value: TestProvidedState<Q>) => void): Promise<void> {
    this.handler?.(get, set, () => {
      return new Promise<Q>((resolve) => {
        this.resolver = resolve
      })
    })
  }
}
