import { Loop, Root } from "../../src/state";

export class TestLoop<S> {
  protected loop: Loop = new Loop()
  private stateDescription: S | undefined

  setState(generator: (loop: Loop) => S) {
    this.stateDescription = generator(this.loop)
  }

  get state(): S {
    return this.stateDescription!
  }

  updateState<T>(root: Root<T>, value: T) {
    this.loop.dispatch(root.updateRequest(value))
  }
}
