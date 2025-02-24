import { activateView } from "@view/index.js"
import superIsland from "./nestedIsland.js"
import { createStore } from "@store/index.js"

activateView(createStore(), document.getElementById("super-island")!, superIsland)
