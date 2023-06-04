import { createDisplay } from "@src/index.js"
import counter from "../islands/counter.js"
import tally from "../islands/tally.js"

const display = createDisplay()
display.mount(document.getElementById("counter")!, counter)

const tallyElements = document.querySelectorAll("[data-click-count]")
for (const element of tallyElements) {
  display.mount(element, tally)
}
