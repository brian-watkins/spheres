import { createStringRenderer } from "@server/index.js";
import { view } from "./view";
import { command, createStore, exec, serialize, useCommand, write } from "@store/index.js";
import { items, suppliedTitle, tokenMap } from "./state";
import { SSRParts } from "../../../helpers/ssrApp";

const store = createStore()
store.dispatch(write(items, [
  { name: "Apple", color: "red" },
  { name: "Banana", color: "yellow" },
]))

const getSuppliedState = command<void>()

useCommand(store, getSuppliedState, {
  exec(_, actions) {
    actions.supply(suppliedTitle, "Fun Stuff!")
  }
})

store.dispatch(exec(getSuppliedState, undefined))

export default function(): SSRParts {
  return {
    html: createStringRenderer(view)(store),
    serializedStore: serialize(store, tokenMap)
  }
}