import * as View from "@src/index.js"
import { clickCount } from "../state.js"
import { selection, store } from "state-party"

const incrementCount = selection(clickCount, ({ current }) => current + 1)

export default View.div([
  View.id("counter")
], [
  View.button([
    View.onClick(() => store(incrementCount))
  ], [
    View.text("Click me!")
  ])
])
