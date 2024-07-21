import { renderToDOM } from "@src/index.js"
import superIsland from "./nestedIsland.js"
import { Store } from "@spheres/store"

renderToDOM(new Store(), document.getElementById("super-island")!, superIsland)
