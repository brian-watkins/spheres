import { createStringRenderer } from "@server/index.js"
import { view } from "./view"
import { createStore, write } from "@store/index.js"
import { items, serializedTokens } from "./state"
import { SSRParts } from "../../../helpers/ssrApp"

const store = createStore()
store.dispatch(write(items, ["item-1", "item-2"]))

const stringRenderer = createStringRenderer(view, {
  stateManifest: serializedTokens,
  activationScripts: ["/behaviors/server/fixtures/ssrApp/listWithShadowRoot/activate.ts"],
})

export default function (): SSRParts {
  return {
    html: stringRenderer(store),
  }
}
