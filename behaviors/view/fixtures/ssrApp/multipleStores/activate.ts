import { activateView } from "@src/index.js"
import counter from "../islands/counter.js"
import tally from "../islands/tally.js"
import { activateStore } from "@spheres/store"

const firstStore = activateStore("store-a")
activateView(firstStore, document.querySelector("#fragment-a #counter")!, counter)
activateView(firstStore, document.querySelector("#fragment-a [data-tally]")!, tally)

const secondStore = activateStore("store-b")
activateView(secondStore, document.querySelector("#fragment-b #counter")!, counter)
activateView(secondStore, document.querySelector("#fragment-b [data-tally]")!, tally)
