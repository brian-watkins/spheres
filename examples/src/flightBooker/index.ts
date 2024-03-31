import { renderToDOM } from "@spheres/view";
import { flightBooker } from "./view.js";
import { Store } from "@spheres/store";

renderToDOM(new Store(), document.getElementById("app")!, flightBooker())