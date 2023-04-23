import * as View from "@src/display"
import withStateIsland from "./withState"

const display = View.createDisplay()
display.mount(document.getElementById("nested-state-island")!, withStateIsland)
