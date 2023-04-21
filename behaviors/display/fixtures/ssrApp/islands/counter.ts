import { GetState, writeMessage } from "@src/index.js"
import * as View from "@src/display/index.js"
import { clickCount } from "../state.js"

export default View.withState({ activationId: "counter" }, (get: GetState) => {
  return View.div([], [
    View.button([
      View.onClick(writeMessage(clickCount, get(clickCount) + 1))
    ], [
      View.text("Click me!")
    ])
  ])
})
