import { funView } from "./view"
import { activateZone } from "@view/index"

const { someView } = await import("./someView")

export function activate() {
  activateZone({
    view(activate) {
      activate(document.body, (root) => {
        root.main(el => {
          el.children
            .subview(someView)
            .subview(funView)
        })
      })
    }
  })
}

activate()