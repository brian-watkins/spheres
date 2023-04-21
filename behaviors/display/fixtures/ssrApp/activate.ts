import * as View from "@src/display"
import counter from "./counter"
import tally from "./tally"

const display = View.createDisplay()
display.activateIsland(counter)
display.activateIsland(tally)
