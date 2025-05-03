import { container, write } from "@store/index";
import { HTMLBuilder } from "@view/htmlElements";
import { useValue } from "view/fixtures/helpers";

const text = container({ initialValue: "" })

export function view(root: HTMLBuilder) {
  root.main(el => {
    el.children
      .h3(el => {
        el.config.dataAttribute("text")
        el.children.textNode(get => get(text))
      })
      .hr()
      .input(el => {
        el.config.on("input", useValue((val) => {
          return write(text, val)
        }))
      })
  })
}