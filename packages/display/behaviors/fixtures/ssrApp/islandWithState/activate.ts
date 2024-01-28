import { renderToDOM } from "@src/view.js"
import withStateIsland from "./withState.js"
import { Store } from "@spheres/store"

const store = new Store()
renderToDOM(store, document.getElementById("nested-state-island")!, withStateIsland)
