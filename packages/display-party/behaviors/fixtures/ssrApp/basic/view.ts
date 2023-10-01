import { View, htmlView } from "@src/index.js"
import counterIsland from "../islands/counter.js"
import tallyIsland from "../islands/tally.js"

export default function (): View {
  return htmlView()
    .div(el => {
      el.children
        .h1(el => el.children.textNode("This is the click counter!"))
        .andThen(() => counterIsland)
        .hr()
        .andThen(() => tallyIsland)
        .hr()
        .andThen(() => tallyIsland)
    })
}

