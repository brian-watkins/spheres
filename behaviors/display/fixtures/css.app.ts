import { container, state, withInitialValue, writeMessage } from "@src/index.js"
import * as View from "@src/display/index.js"

const numberState = container(withInitialValue(17))

const funView = state((get) => {
  return View.div([
    View.id("cool-stuff"),
    View.cssClasses([
      "zoom",
      get(numberState) % 2 == 0 ? "even" : "odd"
    ])
  ], [
    View.text("This is some cool stuff!")
  ])
})


export default function (): View.View {
  return View.div([], [
    View.h1([
      View.cssClasses([
        "super-title"
      ])
    ], ["This is only a test!"]),
    View.viewGenerator(funView),
    View.hr([], []),
    View.input([
      View.data("number-input"),
      View.onInput(value => writeMessage(numberState, Number(value)))
    ], [])
  ])
}

