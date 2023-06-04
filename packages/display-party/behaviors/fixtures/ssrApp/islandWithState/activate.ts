import { createDisplay } from "@src/index.js"
import withStateIsland from "./withState.js"

const display = createDisplay()
display.mount(document.getElementById("nested-state-island")!, withStateIsland)
