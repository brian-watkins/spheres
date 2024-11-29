import { activateStore } from "@spheres/store"
import { activateView } from "@src/htmlViewBuilder"
import { itemInput, itemList, titleText } from "./view"

const store = activateStore()

activateView(store, document.querySelector("#item-form")!, itemInput)
activateView(store, document.querySelector("OL")!, itemList)
activateView(store, document.querySelector("[data-title]")!, titleText)