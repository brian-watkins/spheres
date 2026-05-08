import { createStringRenderer } from "@server/index"
import { createStore } from "@store/store"
import { view } from "./view"
import { SSRParts } from "../../../helpers/ssrApp"

const store = createStore()

export default function(): SSRParts {
  return {
    html: createStringRenderer(view)(store)
  }
}