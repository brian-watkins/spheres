import { view } from "@src/index.js"
import { clickCount } from "../state.js"
import { selection, store, write } from "state-party"

const incrementCount = selection(get => write(clickCount, get(clickCount) + 1))

export default view()
  .div(el => {
    el.config
      .id("counter")
    el.children
      .button(el => {
        el.config
          .on("click", () => store(incrementCount))
        el.children
          .text("Click me!")
      })
  })
