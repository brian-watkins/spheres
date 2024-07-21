import { HTMLBuilder } from "@src/index.js"
import { clickCount } from "../state.js"
import { rule, use, write } from "@spheres/store"

const incrementCount = rule(get => write(clickCount, get(clickCount) + 1))

export default function(root: HTMLBuilder) {
  root.div(el => {
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
}