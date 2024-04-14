import { htmlTemplate } from "@src/index.js"
import counterIsland from "../islands/counter.js"
import tallyIsland from "../islands/tally.js"

export default htmlTemplate(() => root => {
  root.div(el => {
    el.children
      .h1(el => el.children.textNode("This is a click counter!"))
      .zone(counterIsland())
      .zone(tallyIsland())
  })
})