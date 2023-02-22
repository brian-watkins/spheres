import { loop, writeMessage } from "@src/index.js";
import { Loop, Container } from "@src/loop.js";

export class TestLoop<S> {
  private stateDescription: S | undefined

  constructor() {
    loop().reset()
  }

  setState(state: S) {
    this.stateDescription = state
  }

  get state(): S {
    return this.stateDescription!
  }

  update(updater: (loop: Loop) => void) {
    updater(loop())
  }

  updateState<T>(root: Container<T>, value: T) {
    loop().dispatch(writeMessage(root, value))
  }
}
