import { renderToDOM } from "spheres/view";
import { converter } from "./app.js";
import { createStore } from "spheres/store";

renderToDOM(createStore(), document.getElementById("app")!, converter)