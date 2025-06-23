import { activateZone } from "spheres/view";
import { count, counter } from "./counter";

activateZone({
  storeId: "store-one",
  stateMap: { count },
  view(activate) {
    activate(document.querySelector(`[data-zone="one"]`)!, counter)
  },
})