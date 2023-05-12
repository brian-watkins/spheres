import * as View from "@src/index.js"
import superIsland from "./nestedIsland.js"

const display = View.createDisplay()
display.mount(document.getElementById("super-island")!, superIsland)
