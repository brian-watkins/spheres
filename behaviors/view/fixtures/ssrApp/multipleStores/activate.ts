import { activateView, HTMLBuilder } from "@src/index.js"
import counter from "../islands/counter.js"
import tally from "../islands/tally.js"
import { Store } from "@spheres/store"

const firstStore = new Store()
activateView(firstStore, document.querySelector("#fragment-a #counter")!, counter)
activateView(firstStore, document.querySelector("#fragment-a [data-tally]")!, tallyView)

const secondStore = new Store()
activateView(secondStore, document.querySelector("#fragment-b #counter")!, counter)
activateView(secondStore, document.querySelector("#fragment-b [data-tally]")!, tallyView)

function tallyView(root: HTMLBuilder) {
  root.div(el => {
    el.children.subview(tally)
  })
}
