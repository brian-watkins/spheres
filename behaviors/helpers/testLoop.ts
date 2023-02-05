import { Loop, Container, State, writer, StateManager, LoopMessage } from "../../src/state";
import { Managed } from "../../src/asyncStateManager";

export class TestStateManager<T, K = void> implements StateManager<Managed<T, K>> {
  readResolver: ((value: any) => void) | undefined
  lastRefreshKey: K | undefined
  lastValueToWrite: T | undefined

  loadState(value: T) {
    this.readResolver?.({
      type: "write",
      value: {
        type: "loaded",
        value,
        key: this.lastRefreshKey
      }
    })
  }

  update(message: LoopMessage<Managed<T, K>>): void {
    switch (message.type) {
      case "read":
        this.lastRefreshKey = message.value.key
        break
      case "write":
        if (message.value.type === "writing") {
          this.lastValueToWrite = message.value.value
        }
        break
    }
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

  manageState<T, K>(state: State<Managed<T, K>>, reader: StateManager<Managed<T, K>>) {
    this.loop.manageState(state, reader)
  }

  update(updater: (loop: Loop) => void) {
    updater(this.loop)
  }

  updateState<T>(root: Container<T>, value: T) {
    this.loop.dispatch(writer(root)(value))
  }
}
