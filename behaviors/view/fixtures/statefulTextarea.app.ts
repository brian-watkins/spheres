import { container, update } from "@store/index.js"
import { HTMLBuilder } from "@view/index.js"

const textValue = container({ initialValue: "Some initial content!" })

export default function (root: HTMLBuilder) {
  root.main(({ children }) => {
    children
      .textarea((el) => {
        el.config
          .value((get) => get(textValue))
          .on("input", (evt) => update(textValue, () => (evt.target as HTMLTextAreaElement).value))
      })
      .button((el) => {
        el.config.on("click", () => update(textValue, (current) => current.toUpperCase()))
        el.children.textNode("Uppercase!")
      })
  })
}
