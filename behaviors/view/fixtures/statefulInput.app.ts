import { container, GetState, use, write } from "@store/index.js"
import { HTMLBuilder } from "@view/index.js"

const inputValue = container({ initialValue: 17 })

const incrementValue = (get: GetState) => write(inputValue, get(inputValue) + 1)

export default function (root: HTMLBuilder) {
  root.main(({ children }) => {
    children
      .input(el => {
        el.config
          .type("text")
          .value(get => `${get(inputValue)}`)
          .on("input", (evt) => write(inputValue, Number((evt.target as HTMLInputElement).value)))
      })
      .button(el => {
        el.config
          .on("click", () => use(incrementValue))
        el.children
          .textNode("Increment!")
      })
  })
}