import { renderToDOM } from "@src/index.js"
import { view } from "./withState.js"
import { Store } from "@spheres/store"

const store = new Store()
renderToDOM(store, document.getElementById("nested-state-island")!, view)
