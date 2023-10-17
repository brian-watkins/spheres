import { htmlView, View } from "../../src/index.js";

export default function(): View {
  return htmlView()
    .div(el => el.config.innerHTML("<h3>Hello!!!</h3>"))
}