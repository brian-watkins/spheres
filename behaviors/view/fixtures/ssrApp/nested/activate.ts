import { activateView } from "@src/index.js"
import superIsland from "./nestedIsland.js"
import { createStore } from "@spheres/store"

activateView(createStore(), document.getElementById("super-island")!, superIsland)
