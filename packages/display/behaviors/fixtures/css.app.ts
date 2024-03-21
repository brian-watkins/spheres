import { container, write } from "@spheres/store"
import { htmlTemplate } from "@src/index.js"
import { useValue } from "./helpers"

const numberState = container({ initialValue: 17 })

const funView = htmlTemplate(() => {
  return root =>
    root.div(el => {
      el.config
        .id("cool-stuff")
        .class(get => `zoom ${get(numberState) % 2 == 0 ? "even" : "odd"}`)
      el.children
        .textNode("This is some cool stuff!")
    })
})

export default htmlTemplate(() => root => {
  root.div(el => {
    el.children
      .h1(el => {
        el.config
          .class("super-title")
        el.children
          .textNode("This is only a test!")
      })
      .zone(funView())
      .hr()
      .input(el => {
        el.config
          .dataAttribute("number-input")
          .on("input", useValue((value) => write(numberState, Number(value))))
      })
  })
})

