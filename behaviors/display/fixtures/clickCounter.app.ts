import { container, state, withDerivedValue, withInitialValue } from "@src/index.js"
import * as View from "@src/display/index.js"
import { writeMessage } from "@src/loop.js"

export default function (): View.View {
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

  return View.div([], [
    View.h1([], ["This is the click counter!"]),
    View.viewGenerator(clickCounterView)
  ])
}

