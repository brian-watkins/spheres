import { renderToDOM } from "spheres/view"
import { Store } from "spheres/store"
import counter from "./app.js"

renderToDOM(new Store(), document.getElementById("app")!, counter())