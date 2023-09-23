import { nameState } from "../state.js"
import counterIsland from "../islands/counter.js"
import tallyIsland from "../islands/tally.js"
import { view } from "@src/index.js"

export default view()
  .view(get => {
    return view()
      .div(el => {
        el.config.id("super-island")
        el.children
          .h1(el => el.children.text(`This is for ${get(nameState)}!`))
          .view(() => counterIsland)
          .hr()
          .view(() => tallyIsland)
          .hr()
          .view(() => tallyIsland)
      })
  })