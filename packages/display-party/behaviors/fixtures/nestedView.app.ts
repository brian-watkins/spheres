import { container, GetState, write } from "state-party"
import * as View from "@src/index.js"
import { inputValue } from "@src/index.js"

const nameState = container({ initialValue: "hello" })

const ageState = container({ initialValue: 27 })

const ageView = (get: GetState) => {
  return View.p([
    View.data("age")
  ], [
    View.text(`My age is: ${get(ageState)}`)
  ])
}

const nameView = (get: GetState) => {
  const name = get(nameState)
  let children = [
    View.p([View.data("name")], [
      View.text(`My name is: ${name}`)
    ])
  ]
  if (name !== "AGELESS PERSON") {
    children.push(View.withState(ageView))
  }
  return View.div([], children)
}


export default function(): View.View {
  return View.div([], [
    View.h1([], [View.text("This is only a test!")]),
    View.withState(nameView),
    View.hr([], []),
    View.input([
      View.data("name-input"),
      View.onInput(event => write(nameState, inputValue(event)))
    ], []),
    View.input([
      View.data("age-input"),
      View.onInput(event => write(ageState, Number(inputValue(event))))
    ], [])
  ])
}