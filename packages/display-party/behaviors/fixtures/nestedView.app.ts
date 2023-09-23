import { container, GetState, write } from "state-party"
import { inputValue, View, view } from "@src/index.js"

const nameState = container({ initialValue: "hello" })

const ageState = container({ initialValue: 27 })

const ageView = (get: GetState) => {
  return view()
    .p(el => {
      el.config.dataAttribute("age")
      el.children.text(`My age is ${get(ageState)}`)
    })
}

const nameView = (get: GetState) => {
  const name = get(nameState)

  return view()
    .div(el => {
      el.children.p(el => {
        el.config.dataAttribute("name")
        el.children.text(`My name is: ${name}`)
      })
      if (name !== "AGELESS PERSON") {
        el.children.view(ageView)
      }
    })
}


export default function(): View {
  return view()
    .div(el => {
      el.children
        .h1(el => el.children.text("This is only a test!"))
        .view(nameView)
        .hr()
        .input(({config}) => {
          config
            .dataAttribute("name-input")
            .on({
              input: (evt) => write(nameState, inputValue(evt))
            })
        })
        .input(({config}) => {
          config
            .dataAttribute("age-input")
            .on({
              input: evt => write(ageState, Number(inputValue(evt)))
            })
        })
    })
}