import { CommandManager, Store } from "spheres/store";
import { RepeaterCommand } from "../../src/timer/state";

export class TestRepeaterManager implements CommandManager<RepeaterCommand> {
  private current: RepeaterCommand | undefined

  constructor(private store: Store) { }

  exec(message: RepeaterCommand): void {
    this.current = message
  }

  runFor(millis: number) {
    if (!this.current) return

    if (this.current.interval === 0) {
      return
    }

    const loops = Math.floor(millis / this.current.interval)

    for (let i = 0; i < loops; i++) {
      this.store.dispatchWith(this.current.rule)
    }
  }
}