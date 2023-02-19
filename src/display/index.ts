import { loop } from "../index.js";
import { Display } from "./display.js";
import { View } from "./view.js";

export * from "./view.js"
export * from "./display.js"

export function display(view: View): Display {
  return new Display(loop(), view)
}