import { activateView } from "@src/index.js"
import counter from "../islands/counter.js"
import tally from "../islands/tally.js"
import { createStore } from "@spheres/store"

const store = createStore()
activateView(store, document.getElementById("counter")!, counter)

const tallyElements = document.querySelectorAll("[data-tally]")
for (const element of tallyElements) {
  activateView(store, element, tally)
}
