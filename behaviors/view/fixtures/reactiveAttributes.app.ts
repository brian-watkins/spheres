import { HTMLBuilder } from "@src/index.js";
import { container, rule, use, write } from "@spheres/store";

const clicks = container({ initialValue: 0 })
const isDisabled = container({ initialValue: false })
const incrementClicks = rule(get => write(clicks, get(clicks) + 1))

export default function (root: HTMLBuilder) {
  root.main(el => {
    el.children
      .div(el => {
        el.config
          .id("title")
          .class(get => get(clicks) % 2 === 0 ? "on" : "off")
          .attribute("weirdness", get => `${get(clicks)}`)
          .dataAttribute("click-counter", get => `${get(clicks)}`)

        el.children
          .textNode("Hello!")
      })
      .input(el => {
        el.config
          .type("checkbox")
          .checked(get => !get(isDisabled))
          .disabled(get => get(isDisabled))
          .aria("disabled", get => `${get(isDisabled)}`)
      })
      .button(el => {
        el.config
          .dataAttribute("action", "increment")
          .on("click", () => use(incrementClicks))
        el.children.textNode("Click to increment!")
      })
      .button(el => {
        el.config
          .dataAttribute("action", "disable")
          .on("click", () => write(isDisabled, true))
        el.children.textNode("Click to disable!")
      })
  })
}
