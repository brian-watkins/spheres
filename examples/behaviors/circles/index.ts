import { createDisplay } from "display-party"
import { Store, store } from "state-party"
import circles from "../../src/circles/view"
import { addCircleSelection } from "../../src/circles/state"
import { FakeCircle } from "./helpers/fakeCircle"

window.startCircleApp = (testData: Array<FakeCircle>) => {
  const dataStore = new Store()

  for (const circle of testData) {
    dataStore.dispatch(store(addCircleSelection, circle.center))
  }

  const display = createDisplay(dataStore)
  display.mount(document.getElementById("test-display")!, circles())

  // to deselect all circles
  document.querySelectorAll("circle").forEach(circle => {
    circle.dispatchEvent(new MouseEvent("mouseout"))
  })
}
