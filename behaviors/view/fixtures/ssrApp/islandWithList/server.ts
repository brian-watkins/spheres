import { renderToString } from "@src/htmlViewBuilder";
import { view } from "./view";
import { command, createStore, exec, write } from "@spheres/store";
import { items, suppliedTitle, tokenMap } from "./state";
import { SSRParts } from "helpers/ssrApp";

const store = createStore()
store.dispatch(write(items, [
  { name: "Apple", color: "red" },
  { name: "Banana", color: "yellow" },
]))

const getSuppliedState = command<void>()

store.useCommand(getSuppliedState, {
  exec(_, actions) {
    actions.supply(suppliedTitle, "Fun Stuff!")
  }
})

store.dispatch(exec(getSuppliedState, undefined))

export default function(): SSRParts {
  return {
    html: renderToString(store, view),
    serializedStore: store.serialize(tokenMap)
  }
}