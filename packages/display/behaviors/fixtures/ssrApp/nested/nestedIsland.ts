import { nameState } from "../state.js"
import counterIsland from "../islands/counter.js"
import tallyIsland from "../islands/tally.js"
import { htmlView } from "@src/index.js"

export default htmlView()
  .zone(get => {
    return htmlView()
      .div(el => {
        el.config.id("super-island")
        el.children
          .h1(el => el.children.textNode(`This is for ${get(nameState)}!`))
          .zone(() => counterIsland)
          .hr()
          .zone(() => tallyIsland)
          .hr()
          .zone(() => tallyIsland)
      })
  })