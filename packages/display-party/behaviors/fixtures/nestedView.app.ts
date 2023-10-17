import { container, GetState, write } from "state-party"
import { inputValue, View, htmlView } from "@src/index.js"

const nameState = container({ initialValue: "hello" })

const ageState = container({ initialValue: 27 })

const ageView = (get: GetState) => {
  return htmlView()
    .p(el => {
      el.config.dataAttribute("age")
      el.children.textNode(`My age is ${get(ageState)}`)
    })
}

const nameView = (get: GetState) => {
  const name = get(nameState)

  return htmlView()
    .div(el => {
      el.children.p(el => {
        el.config.dataAttribute("name")
        el.children.textNode(`My name is: ${name}`)
      })
      if (name !== "AGELESS PERSON") {
        el.children.zone(ageView)
      }
    })
}


export default function(): View {
  return htmlView()
    .div(el => {
      el.children
        .h1(el => el.children.textNode("This is only a test!"))
        .zone(nameView)
        .hr()
        .input(({config}) => {
          config
            .dataAttribute("name-input")
            .on("input", (evt) => write(nameState, inputValue(evt)))
        })
        .input(({config}) => {
          config
            .dataAttribute("age-input")
            .on("input", evt => write(ageState, Number(inputValue(evt))))
        })
    })
}