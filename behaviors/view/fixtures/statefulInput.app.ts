import { container, GetState, write } from "@spheres/store"
import { HTMLBuilder } from "@src/index"

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
          .on("click", () => incrementValue)
        el.children
          .textNode("Increment!")
      })
  })
}