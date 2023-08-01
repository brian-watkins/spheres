import { view, View } from "../../src/index.js";

export default function(): View {
  return view()
    .div(el => el.config.innerHTML("<h3>Hello!!!</h3>"))
}