import { Loop, Container, State } from "../../src/state";
import { Managed, StateReader } from "../../src/stateManager";

export class TestStateReader<T, K = void> implements StateReader<T, K> {
  readResolver: ((value: Managed<T, K>) => void) | undefined
  lastRefreshKey: K | undefined

  loadState(value: T) {
    this.readResolver?.({
      type: "loaded",
      value
    })
  }

  refresh(key: K) {
    this.lastRefreshKey = key
  }

  onChange(callback: (value: Managed<T, K>) => void) {
    this.readResolver = callback
  }
}

export class TestLoop<S> {
  protected loop: Loop = new Loop()
  private stateDescription: S | undefined

  setState(generator: (loop: Loop) => S) {
    this.stateDescription = generator(this.loop)
  }

  get state(): S {
    return this.stateDescription!
  }

  manageState<T, K>(state: State<Managed<T, K>>, reader: StateReader<T, K>) {
    this.loop.manageState(state, reader)
  }

  updateState<T>(root: Container<T>, value: T) {
    this.loop.dispatch(root.updateRequest(value))
  }
}
