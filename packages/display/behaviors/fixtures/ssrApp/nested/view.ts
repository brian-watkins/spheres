import superIsland from "./nestedIsland.js"
import { htmlTemplate } from "@src/htmlViewBuilder.js"

export default htmlTemplate(() => root => {
  root.div(el => {
    el.children
      .h1(el => el.children.textNode("This is the click counter!"))
      .zone(superIsland())
  })
})