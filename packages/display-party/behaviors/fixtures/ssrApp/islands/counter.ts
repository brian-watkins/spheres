import { htmlView } from "@src/index.js"
import { clickCount } from "../state.js"
import { rule, use, write } from "state-party"

const incrementCount = rule(get => write(clickCount, get(clickCount) + 1))

export default htmlView()
  .div(el => {
    el.config
      .id("counter")
    el.children
      .button(el => {
        el.config
          .on("click", () => use(incrementCount))
        el.children
          .textNode("Click me!")
      })
  })
