import { createStringRenderer } from "@server/index"
import { createStore } from "@store/store"
import { SSRParts } from "server/helpers/ssrApp"
import { view } from "./view"

const store = createStore()

export default function(): SSRParts {
  return {
    html: createStringRenderer(view)(store)
  }
}