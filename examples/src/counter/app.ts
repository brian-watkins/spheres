import { View, htmlView } from "@spheres/display";
import { container, write } from "@spheres/store";

const clickCount = container({
  initialValue: 0,
  reducer: (_: string, current) => current + 1
})

export function counter(): View {
  return htmlView(root => root.main(el => {
    el.children
      .p(el => {
        el.config.dataAttribute("counter-text")
        el.children.textNode((get) => `Clicks: ${get(clickCount)}`)
      })
      .button(el => {
        el.config.on("click", () => write(clickCount, "increment"))
        el.children.textNode("Count!")
      })
  }))
}
