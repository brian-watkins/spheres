import { HTMLBuilder } from "@view/index.js"
import { clickCount } from "../state.js"
import { GetState, use, write } from "@store/index.js"

const incrementCount = (get: GetState) => write(clickCount, get(clickCount) + 1)

export default function (root: HTMLBuilder) {
  root.button(el => {
    el.config
      .on("click", () => use(incrementCount))
    el.children
      .textNode("Click me!")
  })
}