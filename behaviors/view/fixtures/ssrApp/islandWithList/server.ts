import { renderToString } from "@src/htmlViewBuilder";
import { view } from "./view";
import { Store, write } from "@spheres/store";
import { items } from "./item";

const store = new Store()
store.dispatch(write(items, [
  { name: "Apple", color: "red" },
  { name: "Banana", color: "yellow" },
]))

export default function() {
  return renderToString(store, view)
}