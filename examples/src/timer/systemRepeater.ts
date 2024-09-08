import { CommandManager, Store, use } from "spheres/store";
import { RepeaterCommand } from "./state";

export class RepeaterCommandManager implements CommandManager<RepeaterCommand> {
  private timerId: any | undefined

  constructor(private store: Store) { }

  exec(message: RepeaterCommand): void {
    if (this.timerId && message.shouldRun) return
    if (!this.timerId && !message.shouldRun) return
    if (this.timerId && !message.shouldRun) {
      clearInterval(this.timerId)
      this.timerId = undefined
      return
    }
    if (!this.timerId && message.shouldRun) {
      this.timerId = setInterval(() => {
        this.store.dispatch(use(message.rule))
      }, message.interval)
    }
  }
}