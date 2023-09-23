import { View, view } from "@src/index.js";
import withStateIsland from "./withState.js"

export default function (): View {
  return view()
    .div(el => {
      el.children
        .h1(el => {
          el.children.text("THis is the click counter!")
        })
        .view(() => withStateIsland)
    })
}

