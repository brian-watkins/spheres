import * as View from "@src/display"
import { GetState, writeMessage } from "@src/index"
import { clickCount, nameState } from "../state"

export default View.withState({ activationId: "nested-state-island" }, (get) => {
  return View.div([], [
    View.h1([], [
      View.text(`This is ${get(nameState)}'s stuff!`)
    ]),
    View.withState(counterView),
    View.hr([], []),
    View.withState(tallyView),
    View.hr([], []),
    View.withState(tallyView)
  ])
})

function counterView(get: GetState) {
  return View.div([], [
    View.button([
      View.onClick(writeMessage(clickCount, get(clickCount) + 1))
    ], [
      View.text("Click me!")
    ])
  ])
}

function tallyView(get: GetState) {
  return View.p([View.data("click-count")], [
    View.text(`You've clicked the button ${get(clickCount)} times!`)
  ])
}