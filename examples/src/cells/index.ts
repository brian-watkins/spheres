import { renderToDOM } from "spheres/view";
import { cells } from "./view";
import { createStore } from "spheres/store";

renderToDOM(createStore(), document.getElementById("app")!, cells)