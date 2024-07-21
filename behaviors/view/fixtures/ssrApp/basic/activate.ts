import { renderToDOM } from "@src/index.js"
import counter from "../islands/counter.js"
import tally from "../islands/tally.js"
import { Store } from "@spheres/store"

const store = new Store()
renderToDOM(store, document.getElementById("counter")!, counter)

const tallyElements = document.querySelectorAll("[data-click-count]")
for (const element of tallyElements) {
  renderToDOM(store, element, tally)
}
