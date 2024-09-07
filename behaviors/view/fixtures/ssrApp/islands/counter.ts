import { HTMLBuilder } from "@src/index.js"
import { clickCount } from "../state.js"
import { GetState, write } from "@spheres/store"

const incrementCount = (get: GetState) => write(clickCount, get(clickCount) + 1)

export default function(root: HTMLBuilder) {
  root.div(el => {
    el.config
      .id("counter")
    el.children
      .button(el => {
        el.config
          .on("click", () => incrementCount)
        el.children
          .textNode("Click me!")
      })
  })
}