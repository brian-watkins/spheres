import { HTMLBuilder, htmlTemplate } from "@src/index.js"
import counterIsland from "../islands/counter.js"
import tallyIsland from "../islands/tally.js"

export default htmlTemplate(() => (root: HTMLBuilder) => {
  root.div(el => {
    el.children
      .h1(el => el.children.textNode("This is the click counter!"))
      .zone(counterIsland())
      .hr()
      .zone(tallyIsland())
      .hr()
      .zone(tallyIsland())
  })
})