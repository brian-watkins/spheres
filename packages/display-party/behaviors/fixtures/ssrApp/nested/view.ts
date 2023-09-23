import { View, view } from "@src/index.js";
import superIsland from "./nestedIsland.js"

export default function(): View {
  return view()
    .div(el => {
      el.children
        .h1(el => el.children.text("This is the click counter!"))
        .view(() => superIsland)
    })
}