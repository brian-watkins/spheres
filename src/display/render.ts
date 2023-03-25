import toHTML from "snabbdom-to-html";
import { View } from "./view.js";

export function render(view: View): string {
  return toHTML(view)
}