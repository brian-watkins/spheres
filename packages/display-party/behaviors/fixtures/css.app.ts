import { container, GetState, write } from "state-party"
import { inputValue, View, view } from "@src/index.js"

const numberState = container({ initialValue: 17 })

const funView = (get: GetState) => {
  return view()
    .div(el => {
      el.config
        .id("cool-stuff")
        .classes([
          "zoom",
          get(numberState) % 2 == 0 ? "even" : "odd"
        ])
      el.children
        .text("This is some cool stuff!")
    })
}

export default function (): View {
  return view()
    .div(el => {
      el.children
        .h1(el => {
          el.config
            .classes([ "super-title" ])
          el.children
            .text("This is only a test!")
        })
        .withState({ view: funView })
        .hr()
        .input(el => {
          el.config
            .dataAttribute("number-input")
            .on({ input: evt => write(numberState, Number(inputValue(evt))) })
        })
    })
}

