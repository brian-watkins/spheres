import { View, htmlView } from "@src/index.js"
import { container, rule, use, write } from "state-party"

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
        })
        .button(el => {
          el.config
            .on("click", () => use(incrementValue))
        })
    })
}