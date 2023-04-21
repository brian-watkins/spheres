import * as View from "@src/display"
import counter from "../islands/counter"
import tally from "../islands/tally"

const display = View.createDisplay()
display.activateIsland(counter)
display.activateIsland(tally)
