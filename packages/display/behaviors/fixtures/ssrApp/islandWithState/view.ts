import { htmlTemplate } from "@src/index.js";
import { view } from "./withState.js"

export default htmlTemplate(() => {
  return root =>
    root.div(el => {
      el.children
        .h1(el => {
          el.children.textNode("THis is the click counter!")
        })
        .zone(view())
    })
})

