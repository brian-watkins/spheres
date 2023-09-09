import { View, view } from "@src/index.js";
import { container, selection, store, write } from "state-party";

const clicks = container({ initialValue: 0 })
const incrementClicks = selection(get => write(clicks, get(clicks) + 1))

export default function (): View {
  return view()
    .main(el => {
      el.children
        .div(el => {
          el.config
            .id("title")
            .classes((get) => get(clicks) % 2 === 0 ? ["on"] : ["off"])

          el.children
            .text("Hello!")
        })
        .button(el => {
          el.config.on({ click: () => store(incrementClicks) })
          el.children.text("Click me!")
        })
    })
}
