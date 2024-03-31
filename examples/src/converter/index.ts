import { renderToDOM } from "@spheres/view";
import { converter } from "./app.js";
import { Store } from "@spheres/store";

renderToDOM(new Store(), document.getElementById("app")!, converter())