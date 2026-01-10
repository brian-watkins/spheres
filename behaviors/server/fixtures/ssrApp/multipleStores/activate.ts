import counter from "../islands/counter.js"
import tally from "../islands/tally.js"
import { serializedTokens } from "./tokenMap.js"
import { activateZone } from "@view/index.js"

activateZone({
  storeId: "store-a",
  stateManifest: serializedTokens,
  view(activate) {
    activate(document.querySelector("#fragment-a #counter")!, counter)
    activate(document.querySelector("#fragment-a [data-tally]")!, tally)
  },
})

activateZone({
  storeId: "store-b",
  stateManifest: serializedTokens,
  view(activate) {
    activate(document.querySelector("#fragment-b #counter")!, counter)
    activate(document.querySelector("#fragment-b [data-tally]")!, tally)
  },
})
