import { Store } from "@src/store/index.js";
import viewGenerator from "./view.js"
import { render } from "@src/display";

const store = new Store()

export default function() {
  return render(store, viewGenerator())
}