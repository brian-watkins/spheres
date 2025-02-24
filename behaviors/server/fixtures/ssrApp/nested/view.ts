import { HTMLBuilder } from "@view/index.js"
import superIsland from "./nestedIsland.js"

export default function (root: HTMLBuilder) {
  root.div(el => {
    el.children
      .h1(el => el.children.textNode("This is the click counter!"))
      .div(el => {
        el.config.id("super-island")
        el.children.subview(superIsland)
      })
  })
}
