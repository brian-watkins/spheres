import { createStreamRenderer } from "@server/index"
import view from "./view"
import { createStore } from "@store/index"
import { message, serializedTokens, UNTRUSTED_TEXT } from "./state"
import { HTMLBuilder } from "@view/htmlElements"
import { StreamingSSRParts } from "../../../helpers/ssrApp"

const streamRenderer = createStreamRenderer(page, {
  stateManifest: serializedTokens,
  activationScripts: ["/behaviors/server/fixtures/ssrApp/streamingUntrustedText/activate.ts"],
})

function page(root: HTMLBuilder) {
  root.html((el) => {
    el.children
      .head((el) => {
        el.children.link((el) => {
          el.config.rel("icon").href("data:,")
        })
      })
      .body((el) => {
        el.children.subview(view)
      })
  })
}

export default function (): StreamingSSRParts {
  const store = createStore({
    init: async (actions) => {
      await new Promise((resolve) => setTimeout(resolve, 50))
      actions.supply(message, UNTRUSTED_TEXT)
    },
  })

  return {
    stream: streamRenderer(store),
  }
}
