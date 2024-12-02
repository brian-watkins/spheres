import { renderToDOM } from "spheres/view";
import counter from "../../src/counter/app.js";
import { createStore } from "spheres/store";

renderToDOM(createStore(), document.getElementById("test-display")!, counter)