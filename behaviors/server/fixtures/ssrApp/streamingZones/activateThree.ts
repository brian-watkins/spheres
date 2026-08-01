import { activateZone } from "spheres/view";
import { count, counter } from "./counter";

activateZone({
  storeId: "store-three",
  stateManifest: { count },
  setupView(activate) {
    activate(document.querySelector(`[data-zone="three"]`)!, counter)
  },
})