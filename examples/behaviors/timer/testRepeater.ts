import { Repeater } from "../../src/timer/state.js";

export class TestRepeater implements Repeater {
  private runner: (() => void) | undefined
  private interval: number = 0

  repeatEvery(run: () => void, millis: number) {
    this.runner = run
    this.interval = millis
    return "my-repeater-id"
  }
  
  cancel(systemTimerId: any): void {
    if (systemTimerId === "my-repeater-id") {
      this.runner = undefined
      this.interval = 0
    }
  }

  runFor(millis: number) {
    if (this.interval === 0) {
      return
    }

    const loops = Math.floor(millis / this.interval)

    for (let i = 0; i < loops; i++) {
      this.runner?.()
    }
  }
}