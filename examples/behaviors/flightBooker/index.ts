import { renderToDOM } from "spheres/view";
import { flightBooker } from "../../src/flightBooker/view.js";
import { Store } from "spheres/store";

renderToDOM(new Store(), document.getElementById("test-display")!, flightBooker)