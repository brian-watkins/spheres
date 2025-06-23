import { activateZone } from "@view/index.js"
import counter from "../islands/counter.js"
import tally from "../islands/tally.js"

activateZone({
  view(activate) {
    activate(document.getElementById("counter")!, counter)
    const tallyElements = document.querySelectorAll("[data-tally]")
    for (const element of tallyElements) {
      activate(element, tally)
    }
  }
})
