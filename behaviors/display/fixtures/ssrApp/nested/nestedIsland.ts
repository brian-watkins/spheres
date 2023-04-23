import * as View from "@src/display"
import { nameState } from "../state"
import counterIsland from "../islands/counter"
import tallyIsland from "../islands/tally"

export default View.withState((get) => {
  return View.div([ View.id("super-island" )], [
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