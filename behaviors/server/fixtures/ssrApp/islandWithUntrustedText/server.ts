import { createStore, write } from "@store/index.js"
import { createStringRenderer } from "@server/index.js"
import { SSRParts } from "../../../helpers/ssrApp"
import { message, serializedTokens, UNTRUSTED_TEXT } from "./state"
import { view } from "./view"

const store = createStore()
store.dispatch(write(message, UNTRUSTED_TEXT))

export default function (): SSRParts {
  return {
    html: createStringRenderer(view, {
      stateManifest: serializedTokens,
      activationScripts: ["/behaviors/server/fixtures/ssrApp/islandWithUntrustedText/activate.ts"],
    })(store),
  }
}
