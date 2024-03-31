import { renderToDOM } from "@spheres/view";
import counter from "./app.js"
import { Store } from "@spheres/store";

renderToDOM(new Store(), document.getElementById("app")!, counter())