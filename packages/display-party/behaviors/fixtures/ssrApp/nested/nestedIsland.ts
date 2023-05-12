import * as View from "@src/index.js"
import { nameState } from "../state.js"
import counterIsland from "../islands/counter.js"
import tallyIsland from "../islands/tally.js"

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