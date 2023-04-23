import * as View from "@src/display"
import counter from "../islands/counter"
import tally from "../islands/tally"

const display = View.createDisplay()
display.mount(document.getElementById("counter")!, counter)

const tallyElements = document.querySelectorAll("[data-click-count]")
for (const element of tallyElements) {
  display.mount(element, tally)
}
