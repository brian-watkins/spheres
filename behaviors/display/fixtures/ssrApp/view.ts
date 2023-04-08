import * as View from "../../../../src/display/index.js"

export default async function (): Promise<View.View> {
  return View.div([], [
    View.h1([], [
      View.text("This is the click counter!")
    ]),
    await View.island(() => import("./counter.js")),
    View.hr([], []),
    await View.island(() => import("./tally.js"))
  ])
}

