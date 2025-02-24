import { container, write } from "@store/index.js"
import { HTMLBuilder } from "@view/index.js"
import { useValue } from "./helpers"

const numberState = container({ initialValue: 17 })

function funView(root: HTMLBuilder) {
  root.div(el => {
    el.config
      .id("cool-stuff")
      .class(get => `zoom ${get(numberState) % 2 == 0 ? "even" : "odd"}`)
    el.children
      .textNode("This is some cool stuff!")
  })
}

export default function (root: HTMLBuilder) {
  root.div(el => {
    el.children
      .h1(el => {
        el.config
          .class("super-title")
        el.children
          .textNode("This is only a test!")
      })
      .subview(funView)
      .hr()
      .input(el => {
        el.config
          .dataAttribute("number-input")
          .on("input", useValue((value) => write(numberState, Number(value))))
      })
  })
}
