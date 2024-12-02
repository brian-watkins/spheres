import { renderToDOM } from "spheres/view";
import { circles } from "./view";
import { createStore } from "spheres/store";

renderToDOM(createStore(), document.getElementById("app")!, circles)