import { Store, use } from "spheres/store"
import { circles } from "../../src/circles/view"
import { addCircleRule } from "../../src/circles/state"
import { FakeCircle } from "./helpers/fakeCircle"
import { renderToDOM } from "spheres/view"

window.startCircleApp = (testData: Array<FakeCircle>) => {
  const dataStore = new Store()

  for (const circle of testData) {
    dataStore.dispatch(use(addCircleRule(circle.center)))
  }

  renderToDOM(dataStore, document.getElementById("test-display")!, circles)

  // to deselect all circles
  document.querySelectorAll("circle").forEach(circle => {
    circle.dispatchEvent(new MouseEvent("mouseout", { bubbles: true }))
  })
}
