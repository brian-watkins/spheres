import { container, GetState, withInitialValue, write } from "@src/store/index.js"
import * as View from "@src/display/index.js"

const nameState = container(withInitialValue("hello"))

const ageState = container(withInitialValue(27))

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
      View.onInput(value => write(nameState, value))
    ], []),
    View.input([
      View.data("age-input"),
      View.onInput(value => write(ageState, Number(value)))
    ], [])
  ])
}