import { activateStore } from "@spheres/store";
import { activateView } from "@src/index";
import { view } from "./view";

const store = activateStore()
activateView(store, document.body, view)