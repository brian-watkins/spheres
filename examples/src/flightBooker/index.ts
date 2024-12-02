import { renderToDOM } from "spheres/view";
import { flightBooker } from "./view.js";
import { createStore } from "spheres/store";

renderToDOM(createStore(), document.getElementById("app")!, flightBooker)