import { createDisplay } from "display-party"
import { Store, store } from "state-party"
import circles from "../../src/circles/view"
import { Circle, addCircleSelection } from "../../src/circles/state"

window.startCircleApp = (testData: Array<Circle>) => {
  const dataStore = new Store()

  for (const circle of testData) {
    dataStore.dispatch(store(addCircleSelection, circle.center))
  }

  const display = createDisplay(dataStore)
  display.mount(document.getElementById("test-display")!, circles())
}
