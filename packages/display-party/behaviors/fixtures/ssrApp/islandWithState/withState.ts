import * as View from "@src/index.js"
import { clickCount, nameState } from "../state.js"
import { GetState, write } from "state-party"

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

function counterView(get: GetState) {
  return View.div([], [
    View.button([
      View.onClick(write(clickCount, get(clickCount) + 1))
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