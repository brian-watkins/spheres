import { Loop, Container, writer, StateManager, LoopMessage } from "../../src/state";
import { Managed } from "../../src/asyncStateManager";

export class TestStateManager<T, K = void> implements StateManager<Managed<T, K>, K> {
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

  initialValue(key?: K | undefined): Managed<T, K> {
    if (key) {
      return { type: "loading", key }
    } else {
      return { type: "loading" }
    }
  }

  update(message: LoopMessage<Managed<T, K>>): void {
    switch (message.type) {
      case "read":
        switch (message.value.type) {
          case "loading":
            this.lastRefreshKey = message.value.key
            break
          case "loaded":
            this.lastRefreshKey = message.value.key
            break
          case "writing":
            this.lastRefreshKey = undefined
            break
        }
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

  update(updater: (loop: Loop) => void) {
    updater(this.loop)
  }

  updateState<T>(root: Container<T>, value: T) {
    this.loop.dispatch(writer(root)(value))
  }
}
