import { renderToDOM } from "spheres/view";
import { converter } from "../../src/converter/app.js";
import { createStore } from "spheres/store";

renderToDOM(createStore(), document.getElementById("test-display")!, converter)