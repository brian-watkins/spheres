import { anotherView } from "./anotherView";
import { activateZone } from "@view/index";


export function activate() {
  activateZone({
    view(activate) {
      activate(document.body, anotherView)
    },
  })
}

activate()