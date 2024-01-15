import { createDisplay } from "@spheres/display";
import crud from "../../src/crud/view.js";
import { Store, write } from "@spheres/store";
import { DataRecord, createRecord, records } from "../../src/crud/state.js";


window.startApp = (testData: Array<DataRecord>) => {
  const store = new Store()

  for (const record of testData) {
    store.dispatch(write(records, createRecord(record)))
  }

  const display = createDisplay(store)
  display.mount(document.getElementById("test-display")!, crud())
}

