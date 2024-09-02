import { container, update } from "spheres/store";
import { HTMLBuilder } from "../../../src/view";

const clickCount = container({ initialValue: 0 })

export default function (root: HTMLBuilder) {
  root.main(el => {
    el.children
      .p(el => {
        el.config.dataAttribute("counter-text")
        el.children.textNode((get) => `Clicks: ${get(clickCount)}`)
      })
      .button(el => {
        el.config.on("click", () => update(clickCount, (count) => count + 1))
        el.children.textNode("Count!")
      })
  })
}
