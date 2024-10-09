import { Store, write } from "@spheres/store"
import { items } from "./item"
import { activateView } from "@src/htmlViewBuilder"
import { itemInput, itemList } from "./view"

const store = new Store()
store.dispatch(write(items, [
  { name: "Apple", color: "red" },
  { name: "Banana", color: "yellow" },
]))

activateView(store, document.querySelector("#item-form")!, itemInput)
activateView(store, document.querySelector("OL")!, itemList)
