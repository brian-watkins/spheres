import { createStreamRenderer } from "@server/index"
import view from "./view"
import { createStore, meta, pending, write } from "@store/index"
import { serializedTokens, someWord, Thing, things, thingValue } from "./state"
import { HTMLBuilder } from "@view/htmlElements"
import { StreamingSSRParts } from "../../../helpers/ssrApp"

const streamRenderer = createStreamRenderer(page, {
  stateManifest: serializedTokens,
  activationScripts: [
    "/behaviors/server/fixtures/ssrApp/streaming/activate.ts"
  ]
})

function page(root: HTMLBuilder) {
  root.html(el => {
    el.children
      .head(el => {
        el.children
          .link(el => {
            el.config
              .rel("icon")
              .href("data:,")
          })
      })
      .body(el => {
        el.children.subview(view)
      })
  })
}

const thingsServerState: Array<Thing> = [
  { name: "cows", color: "black and white" },
  { name: "wine", color: "red" },
  { name: "clouds", color: "dark gray" },
  { name: "paint", color: "pink" },
  { name: "camels", color: "brown" },
  { name: "fruit", color: "blue" }
]

const thingValueServerState = "tens of"

export default function (): StreamingSSRParts {
  const store = createStore({
    init: async (actions, store) => {
      actions.supply(meta(things), pending([]))

      const thingPromise = new Promise<void>(resolve => {
        setTimeout(() => {
          actions.supply(things, thingsServerState)
          resolve()
        }, 200)
      })

      actions.supply(meta(thingValue), pending(""))

      const thingValuePromise = new Promise<void>(resolve => {
        setTimeout(() => {
          actions.supply(thingValue, thingValueServerState)
          resolve()
        }, 100)
      })

      await Promise.all([thingPromise, thingValuePromise])

      store.dispatch(write(someWord, "Hello from server!"))
    }
  })

  return {
    stream: streamRenderer(store)
  }
}
