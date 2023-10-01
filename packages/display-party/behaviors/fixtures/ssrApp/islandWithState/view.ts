import { View, htmlView } from "@src/index.js";
import withStateIsland from "./withState.js"

export default function (): View {
  return htmlView()
    .div(el => {
      el.children
        .h1(el => {
          el.children.textNode("THis is the click counter!")
        })
        .andThen(() => withStateIsland)
    })
}

