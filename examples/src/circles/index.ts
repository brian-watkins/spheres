import { renderToDOM } from "spheres/view";
import { circles } from "./view";
import { Store } from "spheres/store";

renderToDOM(new Store(), document.getElementById("app")!, circles())