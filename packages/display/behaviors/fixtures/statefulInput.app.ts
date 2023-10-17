import { View, htmlView } from "@src/index.js"
import { container, rule, use, write } from "@spheres/store"

const inputValue = container({ initialValue: 17 })

const incrementValue = rule((get) => write(inputValue, get(inputValue) + 1))

export default function(): View {
  return htmlView()
    .main(({ children }) => {
      children
        .input(el => {
          el.config
            .type("text")
            .value((get) => `${get(inputValue)}`)
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