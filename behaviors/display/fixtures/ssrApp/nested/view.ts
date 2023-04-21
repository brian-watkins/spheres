import * as View from "@src/display/index.js"
import superIsland from "./nestedIsland.js"

export default function (): View.View {
  return View.div([], [
    View.h1([], [
      View.text("This is the click counter!")
    ]),
    superIsland
  ])
}

