import { nameState } from "../state.js"
import counterIsland from "../islands/counter.js"
import tallyIsland from "../islands/tally.js"
import { HTMLBuilder } from "@view/index.js"

export default function (root: HTMLBuilder) {
  root.div(el => {
    el.children
      .h1(el => el.children.textNode(get => `This is for ${get(nameState)}!`))
      .subview(counterIsland)
      .hr()
      .subview(tallyIsland)
      .hr()
      .subview(tallyIsland)
  })
}
