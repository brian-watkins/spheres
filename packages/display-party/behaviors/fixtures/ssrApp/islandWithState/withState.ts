import * as View from "@src/index.js"
import { clickCount, nameState } from "../state.js"
import { GetState, selection, store } from "state-party"

export default View.withState((get) => {
  return View.div([ View.id("nested-state-island" )], [
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

const incrementCount = selection(clickCount, ({current}) => current + 1)

function counterView() {
  return View.div([], [
    View.button([
      View.onClick(() => store(incrementCount))
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