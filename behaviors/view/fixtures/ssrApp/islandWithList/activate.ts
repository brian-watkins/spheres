import { createStore } from "@spheres/store"
import { activateView } from "@src/htmlViewBuilder"
import { itemInput, itemList, titleText } from "./view"
import { tokenMap } from "./state"

const store = createStore()
store.deserialize(tokenMap)

activateView(store, document.querySelector("#item-form")!, itemInput)
activateView(store, document.querySelector("OL")!, itemList)
activateView(store, document.querySelector("[data-title]")!, titleText)