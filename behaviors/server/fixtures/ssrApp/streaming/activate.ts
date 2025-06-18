import { createStore, deserialize } from "@store/store"
import { activateView } from "@view/index"
import view from "./view"
import { serializedTokens } from "./state"
import { Container, write } from "@store/index"

const store = createStore()
deserialize(store, serializedTokens)

activateView(store, document.body, view)

//@ts-ignore
for (const data of window.__spheresStoreMessages) {
  store.dispatch(write(serializedTokens[data.token] as Container<any>, data.data))
}

window.addEventListener("spheres-store", (event) => {
  const detail = (event as CustomEvent).detail
  store.dispatch(write(serializedTokens[detail.token] as Container<any>, detail.data))
})