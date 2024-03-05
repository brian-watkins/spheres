import { HTMLBuilder } from "@src/htmlElements.js"
import superIsland from "./nestedIsland.js"

export default function view(root: HTMLBuilder) {
  root.div(el => {
    el.children
      .h1(el => el.children.textNode("This is the click counter!"))
      .zone(superIsland)
  })
}