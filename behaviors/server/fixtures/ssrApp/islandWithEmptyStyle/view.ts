import { container, write } from "@store/index"
import { HTMLBuilder } from "@view/htmlElements"
import { useValue } from "../../../../view/fixtures/helpers"

const css = container({ initialValue: "" })

export function view(root: HTMLBuilder) {
  root.main((el) => {
    el.children
      .style((el) => {
        el.config.dataAttribute("style")
        el.children.textNode((get) => get(css))
      })
      .input((el) => {
        el.config.on(
          "input",
          useValue((val) => {
            return write(css, val)
          }),
        )
      })
  })
}
