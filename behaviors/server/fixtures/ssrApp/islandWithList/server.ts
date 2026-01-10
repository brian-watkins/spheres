import { createStringRenderer } from "@server/index.js";
import { view } from "./view";
import { command, createStore, exec, useCommand, write } from "@store/index.js";
import { items, serializedTokens, suppliedTitle } from "./state";
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

const stringRenderer = createStringRenderer(view, {
  stateManifest: serializedTokens,
  activationScripts: [
    "/behaviors/server/fixtures/ssrApp/islandWithList/activate.ts"
  ]
})

export default function (): SSRParts {
  return {
    html: stringRenderer(store),
  }
}