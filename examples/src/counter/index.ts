import { renderToDOM } from "spheres/view"
import { createStore } from "spheres/store"
import counter from "./app.js"

renderToDOM(createStore(), document.getElementById("app")!, counter)