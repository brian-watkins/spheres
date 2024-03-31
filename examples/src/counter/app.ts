import { htmlTemplate } from "@spheres/display";
import { container, write } from "@spheres/store";

const clickCount = container({
  initialValue: 0,
  update: (_: string, current) => ({ value: current + 1 })
})

export default htmlTemplate(() => root => {
  root.main(el => {
    el.children
      .p(el => {
        el.config.dataAttribute("counter-text")
        el.children.textNode((get) => `Clicks: ${get(clickCount)}`)
      })
      .button(el => {
        el.config.on("click", () => write(clickCount, "increment"))
        el.children.textNode("Count!")
      })
  })
})
