import { renderToDOM } from "@src/view.js"
import superIsland from "./nestedIsland.js"
import { Store } from "@spheres/store"

renderToDOM(new Store(), document.getElementById("super-island")!, superIsland)
