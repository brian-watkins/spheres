import { HTMLBuilder } from "@src/index.js";
import withStateIsland from "./withState.js"

export default function (root: HTMLBuilder) {
  return root.div(el => {
    el.children
      .h1(el => {
        el.children.textNode("THis is the click counter!")
      })
      .zone(withStateIsland)
  })
}

