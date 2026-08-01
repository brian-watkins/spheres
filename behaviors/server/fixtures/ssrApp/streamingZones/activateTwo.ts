import { activateZone } from "spheres/view";
import { count, counter } from "./counter";

activateZone({
  storeId: "store-two",
  stateManifest: { count },
  setupView(activate) {
    activate(document.querySelector(`[data-zone="two"]`)!, counter)
  },
})