import { activateView } from "@view/index.js"
import counter from "../islands/counter.js"
import tally from "../islands/tally.js"
import { createStore, deserialize } from "@store/index.js"
import { tokenMap } from "./tokenMap.js"

const firstStore = createStore("store-a")
deserialize(firstStore, tokenMap)

activateView(firstStore, document.querySelector("#fragment-a #counter")!, counter)
activateView(firstStore, document.querySelector("#fragment-a [data-tally]")!, tally)

const secondStore = createStore("store-b")
deserialize(secondStore, tokenMap)

activateView(secondStore, document.querySelector("#fragment-b #counter")!, counter)
activateView(secondStore, document.querySelector("#fragment-b [data-tally]")!, tally)
