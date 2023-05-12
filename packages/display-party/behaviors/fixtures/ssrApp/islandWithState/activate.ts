import * as View from "@src/index.js"
import withStateIsland from "./withState.js"

const display = View.createDisplay()
display.mount(document.getElementById("nested-state-island")!, withStateIsland)
