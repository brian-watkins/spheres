import { renderToDOM } from "spheres/view";
import counter from "../../src/counter/app.js";
import { Store } from "spheres/store";

renderToDOM(new Store(), document.getElementById("test-display")!, counter)