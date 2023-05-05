import * as View from "@src/display"
import counter from "../islands/counter"
import tally from "../islands/tally"
import { Store } from "@src/store"

const firstStore = new Store()
const firstDisplay = View.createDisplay(firstStore)
firstDisplay.mount(document.querySelector("#fragment-a #counter")!, counter)
firstDisplay.mount(document.querySelector("#fragment-a [data-click-count]")!, tally)

const secondStore = new Store()
const secondDisplay = View.createDisplay(secondStore)
secondDisplay.mount(document.querySelector("#fragment-b #counter")!, counter)
secondDisplay.mount(document.querySelector("#fragment-b [data-click-count]")!, tally)
