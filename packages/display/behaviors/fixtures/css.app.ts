import { container, write } from "@spheres/store"
import { inputValue, View, htmlView } from "@src/index.js"

const numberState = container({ initialValue: 17 })

const funView = () => {
  return htmlView()
    .div(el => {
      el.config
        .id("cool-stuff")
        .class((get) => `zoom ${get(numberState) % 2 == 0 ? "even" : "odd"}`)
      el.children
        .textNode("This is some cool stuff!")
    })
}

export default function (): View {
  return htmlView()
    .div(el => {
      el.children
        .h1(el => {
          el.config
            .class("super-title")
          el.children
            .textNode("This is only a test!")
        })
        .zone(funView)
        .hr()
        .input(el => {
          el.config
            .dataAttribute("number-input")
            .on("input", evt => write(numberState, Number(inputValue(evt))))
        })
    })
}

