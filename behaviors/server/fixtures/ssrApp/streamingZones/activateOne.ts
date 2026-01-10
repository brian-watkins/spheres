import { activateZone } from "spheres/view";
import { count, counter } from "./counter";

activateZone({
  storeId: "store-one",
  stateManifest: { count },
  view(activate) {
    activate(document.querySelector(`[data-zone="one"]`)!, counter)
  },
})