import { renderToDOM } from "@src/index.js"
import counter from "../islands/counter.js"
import tally from "../islands/tally.js"
import { Store } from "@spheres/store"

const firstStore = new Store()
renderToDOM(firstStore, document.querySelector("#fragment-a #counter")!, counter())
renderToDOM(firstStore, document.querySelector("#fragment-a [data-click-count]")!, tally())

const secondStore = new Store()
renderToDOM(secondStore, document.querySelector("#fragment-b #counter")!, counter())
renderToDOM(secondStore, document.querySelector("#fragment-b [data-click-count]")!, tally())
