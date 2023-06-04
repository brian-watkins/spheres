import { nameState } from "../state.js"
import counterIsland from "../islands/counter.js"
import tallyIsland from "../islands/tally.js"
import { view } from "@src/index.js"

export default view()
  .withState(get => {
    return view()
      .div(el => {
        el.config.id("super-island")
        el.view
          .h1(el => el.view.text(`This is for ${get(nameState)}!`))
          .withView(counterIsland)
          .hr()
          .withView(tallyIsland)
          .hr()
          .withView(tallyIsland)
      })
  })