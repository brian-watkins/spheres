import * as View from "@src/display"
import { nameState } from "../state"
import counterIsland from "../islands/counter"
import tallyIsland from "../islands/tally"

export default View.island("super-island", (get) => {
  return View.div([], [
    View.h1([], [
      View.text(`This is for ${get(nameState)}!`)
    ]),
    counterIsland,
    View.hr([], []),
    tallyIsland,
    View.hr([], []),
    tallyIsland
  ])
})