import { GetState, container, withInitialValue, write } from "state-party"
import * as View from "@src/index.js"

const clickCount = container(withInitialValue(0))

const clickCounterView = (get: GetState) => {
  return View.div([], [
    View.button([
      View.onClick(write(clickCount, get(clickCount) + 1))
    ], [
      View.text("Click me!")
    ]),
    View.p([View.data("click-count")], [
      View.text(`You've clicked the button ${get(clickCount)} times!`)
    ])
  ])
}

export default function (): View.View {
  return View.div([], [
    View.h1([], [
      View.text("This is the click counter!")
    ]),
    View.withState(clickCounterView)
  ])
}

