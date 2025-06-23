import { activateZone } from "@view/index.js"
import { itemInput, itemList, titleText } from "./view"
import { serializedTokens } from "./state"

activateZone({
  stateMap: serializedTokens,
  view: (activate) => {
    activate(document.querySelector("#item-form")!, itemInput)
    activate(document.querySelector("OL")!, itemList)
    activate(document.querySelector("[data-title]")!, titleText)
  }
})