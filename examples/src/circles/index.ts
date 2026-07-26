import { renderToDOM, withDomActions } from "spheres/view";
import { circles } from "./view";
import { createStore, useCommand } from "spheres/store";
import { PopoverController, showPopover } from "./popover";

const store = createStore()

useCommand(store, showPopover, withDomActions(new PopoverController()))

renderToDOM(store, document.getElementById("app")!, circles)