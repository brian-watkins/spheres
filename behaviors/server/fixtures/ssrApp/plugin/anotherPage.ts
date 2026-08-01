import { anotherView } from "./anotherView";
import { activateZone } from "@view/index";


export function activate() {
  activateZone({
    setupView(activate) {
      activate(document.body, anotherView)
    },
  })
}

activate()