import * as View from "@src/index.js"
import { clickCount } from "../state.js"
import { GetState, write } from "state-party"

export default View.withState((get: GetState) => {
  return View.div([ View.id("counter") ], [
    View.button([
      View.onClick(write(clickCount, get(clickCount) + 1))
    ], [
      View.text("Click me!")
    ])
  ])
})
