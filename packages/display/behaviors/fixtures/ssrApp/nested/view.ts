import { View, htmlView } from "@src/index.js";
import superIsland from "./nestedIsland.js"

export default function(): View {
  return htmlView(root => {
    root.div(el => {
      el.children
        .h1(el => el.children.textNode("This is the click counter!"))
        .zone(superIsland)
    })
  })
}