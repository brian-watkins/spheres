import { container, GetState, withInitialValue, writeMessage } from "@src/index.js"
import * as View from "@src/display/index.js"

const numberState = container(withInitialValue(17))

const funView = (get: GetState) => {
  return View.div([
    View.id("cool-stuff"),
    View.cssClasses([
      "zoom",
      get(numberState) % 2 == 0 ? "even" : "odd"
    ])
  ], [
    View.text("This is some cool stuff!")
  ])
}


export default function (): View.View {
  return View.div([], [
    View.h1([
      View.cssClasses([
        "super-title"
      ])
    ], [
      View.text("This is only a test!")
    ]),
    View.withState(funView),
    View.hr([], []),
    View.input([
      View.data("number-input"),
      View.onInput(value => writeMessage(numberState, Number(value)))
    ], [])
  ])
}

