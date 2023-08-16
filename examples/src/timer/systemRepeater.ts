import { Repeater, RepeaterId } from "./state.js";

export const systemRepeater: Repeater = {
  repeatEvery(run, millis) {
    return setInterval(run, millis)
  },
  cancel(id: RepeaterId) {
    clearInterval(id)
  }
}