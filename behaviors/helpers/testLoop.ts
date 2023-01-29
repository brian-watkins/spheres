import { Loop, Container, State } from "../../src/state";
import { Managed, StateManager } from "../../src/stateManager";

export class TestManager<T> implements StateManager<T> {
  readResolver: ((value: Managed<T>) => void) | undefined
  
  loadState(value: T) {
    this.readResolver?.({
      type: "loaded",
      value
    })
  }

  onChange(callback: (value: Managed<T>) => void) {
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

  manageState<T>(state: State<Managed<T>>, manager: StateManager<T>) {
    this.loop.manageState(state, manager)
  }

  updateState<T>(root: Container<T>, value: T) {
    this.loop.dispatch(root.updateRequest(value))
  }
}
