import * as View from "@src/display"
import superIsland from "./nestedIsland"

const display = View.createDisplay()
display.mount(document.getElementById("super-island")!, superIsland)
