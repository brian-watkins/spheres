import { View, htmlView } from "@src/index.js"
import { container, selection, store, write } from "state-party"

const inputValue = container({ initialValue: 17 })

const incrementValue = selection((get) => write(inputValue, get(inputValue) + 1))

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
            .on("click", () => store(incrementValue))
        })
    })
}