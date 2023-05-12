import * as View from "@src/index.js"
import counter from "../islands/counter.js"
import tally from "../islands/tally.js"
import { Store } from "state-party"

const firstStore = new Store()
const firstDisplay = View.createDisplay(firstStore)
firstDisplay.mount(document.querySelector("#fragment-a #counter")!, counter)
firstDisplay.mount(document.querySelector("#fragment-a [data-click-count]")!, tally)

const secondStore = new Store()
const secondDisplay = View.createDisplay(secondStore)
secondDisplay.mount(document.querySelector("#fragment-b #counter")!, counter)
secondDisplay.mount(document.querySelector("#fragment-b [data-click-count]")!, tally)
