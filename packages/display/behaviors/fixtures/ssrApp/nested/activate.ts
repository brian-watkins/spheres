import { createDisplay } from "@src/index.js"
import superIsland from "./nestedIsland.js"

const display = createDisplay()
display.mount(document.getElementById("super-island")!, superIsland)
