import * as View from "@src/display/index.js"
import withStateIsland from "./withState.js"

export default function (): View.View {
  return View.div([], [
    View.h1([], [
      View.text("This is the click counter!")
    ]),
    withStateIsland
  ])
}

