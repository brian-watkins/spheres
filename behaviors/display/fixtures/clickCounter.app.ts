import { container, state, withDerivedValue, withInitialValue, writeMessage } from "@src/index.js"
import * as View from "@src/display/index.js"

const clickCount = container(withInitialValue(0))

const clickCounterView = state(withDerivedValue((get) => {
  return View.div([], [
    View.button([
      View.onClick(writeMessage(clickCount, get(clickCount) + 1))
    ], ["Click me!"]),
    View.p([View.data("click-count")], [
      `You've clicked the button ${get(clickCount)} times!`
    ])
  ])
}))

export default function (): View.View {
  return View.div([], [
    View.h1([], ["This is the click counter!"]),
    View.viewGenerator(clickCounterView)
  ])
}

