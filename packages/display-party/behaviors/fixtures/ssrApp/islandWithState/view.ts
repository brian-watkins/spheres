import { View, view } from "@src/index.js";
import withStateIsland from "./withState.js"

export default function (): View {
  return view()
    .div(el => {
      el.view
        .h1(el => {
          el.view.text("THis is the click counter!")
        })
        .withView(withStateIsland)
    })
}

