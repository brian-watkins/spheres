import { renderToDOM } from "spheres/view";
import { flightBooker } from "../../src/flightBooker/view.js";
import { createStore } from "spheres/store";

renderToDOM(createStore(), document.getElementById("test-display")!, flightBooker)