import { container, state, withInitialValue, writeMessage } from "@src/index.js"
import * as View from "@src/display/index.js"

const nameState = container(withInitialValue("hello"))

const ageState = container(withInitialValue(27))

const ageView = state((get) => {
  return View.p([View.data("age")], [
    `My age is: ${get(ageState)}`
  ])
})

const nameView = state((get) => {
  const name = get(nameState)
  let children = [
    View.p([View.data("name")], [
      `My name is: ${name}`
    ])
  ]
  if (name !== "AGELESS PERSON") {
    children.push(View.viewGenerator(ageView))
  }
  return View.div([], children)
})


export default function(): View.View {
  return View.div([], [
    View.h1([], ["This is only a test!"]),
    View.viewGenerator(nameView),
    View.hr([], []),
    View.input([
      View.data("name-input"),
      View.onInput(value => writeMessage(nameState, value))
    ], []),
    View.input([
      View.data("age-input"),
      View.onInput(value => writeMessage(ageState, Number(value)))
    ], [])
  ])
}