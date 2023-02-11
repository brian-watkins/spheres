import { Loop, Container, writeMessage } from "../../src/state";

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
    this.loop.dispatch(writeMessage(root, value))
  }
}
