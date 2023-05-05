import { Store } from "../store/index.js";
import { Display } from "./display.js";

export * from "./view.js"
export * from "./display.js"
export * from "./render.js"

export function createDisplay(store: Store = new Store()): Display {
  return new Display(store)
}
