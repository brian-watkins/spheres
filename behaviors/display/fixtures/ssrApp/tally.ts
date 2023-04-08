import * as View from "../../../../src/display/index.js"
import { GetState } from "../../../../src/index.js"
import { clickCount } from "./state.js"

export default function(get: GetState): View.View {
  return View.p([View.data("click-count")], [
    View.text(`You've clicked the button ${get(clickCount)} times!`)
  ])
}