import { activateView } from "@src/index.js"
import superIsland from "./nestedIsland.js"
import { Store } from "@spheres/store"

activateView(new Store(), document.getElementById("super-island")!, superIsland)
