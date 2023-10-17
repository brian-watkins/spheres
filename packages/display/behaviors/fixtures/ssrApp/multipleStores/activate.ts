import { createDisplay } from "@src/index.js"
import counter from "../islands/counter.js"
import tally from "../islands/tally.js"
import { Store } from "@spheres/store"

const firstStore = new Store()
const firstDisplay = createDisplay(firstStore)
firstDisplay.mount(document.querySelector("#fragment-a #counter")!, counter)
firstDisplay.mount(document.querySelector("#fragment-a [data-click-count]")!, tally)

const secondStore = new Store()
const secondDisplay = createDisplay(secondStore)
secondDisplay.mount(document.querySelector("#fragment-b #counter")!, counter)
secondDisplay.mount(document.querySelector("#fragment-b [data-click-count]")!, tally)
