import { createDisplay } from "display-party";
import crud from "../../src/crud/view.js";
import { Store } from "state-party";
import { DataRecord, createRecord, records } from "../../src/crud/state.js";


window.startApp = (testData: Array<DataRecord>) => {
  const store = new Store()

  store.useProvider({
    provide: ({ set }) => {
      for (const record of testData) {
        set(records, createRecord(record))
      }
    },
  })

  const display = createDisplay(store)
  display.mount(document.getElementById("test-display")!, crud())
}

