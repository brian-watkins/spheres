import { View, view } from "@src/index.js";
import { container, selection, store, write } from "state-party";

const clicks = container({ initialValue: 0 })
const isDisabled = container({ initialValue: false })
const incrementClicks = selection(get => write(clicks, get(clicks) + 1))

export default function (): View {
  return view()
    .main(el => {
      el.children
        .div(el => {
          el.config
            .id("title")
            .class((get) => get(clicks) % 2 === 0 ? "on" : "off")
            .dataAttribute("click-counter", (get) => `${get(clicks)}`)

          el.children
            .text("Hello!")
        })
        .input(el => {
          el.config
            .type("checkbox")
            .checked((get) => !get(isDisabled))
            .disabled((get) => get(isDisabled))
        })
        .button(el => {
          el.config
            .dataAttribute("action", "increment")
            .on({ click: () => store(incrementClicks) })
          el.children.text("Click to increment!")
        })
        .button(el => {
          el.config
            .dataAttribute("action", "disable")
            .on({ click: () => write(isDisabled, true) })
          el.children.text("Click to disable!")
        })
    })
}
