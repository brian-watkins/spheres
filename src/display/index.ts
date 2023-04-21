import { loop } from "../index.js";
import { Display } from "./display.js";

export * from "./view.js"
export * from "./display.js"
export * from "./render.js"

export function createDisplay(): Display {
  return new Display(loop())
}
