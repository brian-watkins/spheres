import { renderToDOM } from "@spheres/display";
import { flightBooker } from "../../src/flightBooker/view.js";
import { Store } from "@spheres/store";

renderToDOM(new Store(), document.getElementById("test-display")!, flightBooker())