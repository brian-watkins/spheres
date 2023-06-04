import { View, view } from "@src/index.js";
import superIsland from "./nestedIsland.js"

export default function(): View {
  return view()
    .div(el => {
      el.view
        .h1(el => el.view.text("This is the click counter!"))
        .withView(superIsland)
    })
}