import { createStore, deserialize } from "@store/index.js"
import { activateView } from "@view/index.js"
import { itemInput, itemList, titleText } from "./view"
import { serializedTokens } from "./state"

const store = createStore()
deserialize(store, serializedTokens)

activateView(store, document.querySelector("#item-form")!, itemInput)
activateView(store, document.querySelector("OL")!, itemList)
activateView(store, document.querySelector("[data-title]")!, titleText)