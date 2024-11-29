import { HTMLBuilder } from "@src/index.js"
import counterIsland from "../islands/counter.js"
import tallyIsland from "../islands/tally.js"

export default function (root: HTMLBuilder) {
  root.div(el => {
    el.children
      .h1(el => el.children.textNode("This is a click counter!"))
      .div(el => {
        el.config.id("counter")
        el.children.subview(counterIsland)
      })
      .div(el => {
        el.config.dataAttribute("tally")
        el.children.subview(tallyIsland)
      })
  })
}
