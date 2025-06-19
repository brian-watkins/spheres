import { createStringRenderer } from "@server/index"
import view from "./view"
import { createStore, serialize } from "@store/index"
import { SimpleQueue, StoreData, StreamingSSRParts } from "server/helpers/ssrApp"
import { serializedTokens, Thing, things, thingValue } from "./state"

const viewRenderer = createStringRenderer(view)

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
  const queue = new SimpleQueue<string>()

  const store = createStore({
    initializer: async (actions) => {
      actions.pending(things, [])

      setTimeout(() => {
        queue.push(scriptTag({
          storeId: store.id,
          token: "things",
          data: thingsServerState
        }))
        queue.end()
      }, 200)

      actions.pending(thingValue, "")

      setTimeout(() => {
        queue.push(scriptTag({
          storeId: store.id,
          token: "thingValue",
          data: thingValueServerState
        }))
      }, 100)
    }
  })

  return {
    initialHTML: viewRenderer(store),
    serializedStore: serialize(store, serializedTokens),
    streamingData: queue
  }
}

function scriptTag(data: StoreData): string {
  return `<script>
window.dispatchEvent(new CustomEvent("spheres-store", {
  detail: ${JSON.stringify(data)},
  bubbles: true,
  cancelable: true
}))
</script>`
}
