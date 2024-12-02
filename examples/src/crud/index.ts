import { renderToDOM } from "spheres/view";
import { crud } from "./view.js";
import { createStore } from "spheres/store";

renderToDOM(createStore(), document.getElementById("app")!, crud)