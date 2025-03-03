import { createStore, write } from "@store/index.js";
import { addItem, Item, items, tokenMap } from "./state";
import { SSRParts } from "../../../helpers/ssrApp";
import { createStringRenderer } from "@server/index.js";
import { view } from "./view";

function testItem(testId: number): Item {
  return {
    name: `Item-${testId}`
  }
}

const store = createStore()
store.dispatch(write(items, addItem(testItem(1))))
store.dispatch(write(items, addItem(testItem(2))))
store.dispatch(write(items, addItem(testItem(3))))

export default function(): SSRParts {
  return {
    html: createStringRenderer(view)(store),
    serializedStore: store.serialize(tokenMap)
  }
}