import { View, view } from "@src/index.js"
import counterIsland from "../islands/counter.js"
import tallyIsland from "../islands/tally.js"

export default function (): View {
  return view()
    .div(el => {
      el.view
        .h1(el => el.view.text("This is a click counter!"))
        .withView(counterIsland)
        .withView(tallyIsland)
    })
}

