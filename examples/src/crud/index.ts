import { renderToDOM } from "spheres/view";
import { crud } from "./view.js";
import { Store } from "spheres/store";

renderToDOM(new Store(), document.getElementById("app")!, crud)