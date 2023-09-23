import { View, view } from "@src/index.js"
import counterIsland from "../islands/counter.js"
import tallyIsland from "../islands/tally.js"

export default function (): View {
  return view()
    .div(el => {
      el.children
        .h1(el => el.children.text("This is the click counter!"))
        .view(() => counterIsland)
        .hr()
        .view(() => tallyIsland)
        .hr()
        .view(() => tallyIsland)
    })
}

