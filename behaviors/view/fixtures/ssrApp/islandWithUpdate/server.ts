import { Store, write } from "@spheres/store";
import { addItem, Item, items } from "./state";
import { SSRParts } from "helpers/ssrApp";
import { renderToString } from "@src/htmlViewBuilder";
import { view } from "./view";

function testItem(testId: number): Item {
  return {
    name: `Item-${testId}`
  }
}

const store = new Store()
store.dispatch(write(items, addItem(testItem(1))))
store.dispatch(write(items, addItem(testItem(2))))
store.dispatch(write(items, addItem(testItem(3))))

export default function(): SSRParts {
  return {
    html: renderToString(store, view),
    serializedStore: store.serialize()
  }
}