import { view } from "@src/index.js"
import { clickCount } from "../state.js"
import { selection, store } from "state-party"

const incrementCount = selection(clickCount, ({ current }) => current + 1)

export default view()
  .div(el => {
    el.config
      .id("counter")
    el.view
      .button(el => {
        el.config
          .onClick(() => store(incrementCount))
        el.view
          .text("Click me!")
      })
  })
