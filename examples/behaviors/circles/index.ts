import { createStore, use, useCommand } from "spheres/store"
import { circles } from "../../src/circles/view"
import { addCircleRule } from "../../src/circles/state"
import { PopoverController, showPopover } from "../../src/circles/popover"
import { FakeCircle } from "./helpers/fakeCircle"
import { renderToDOM, withDomActions } from "spheres/view"

window.startCircleApp = (testData: Array<FakeCircle>) => {
  const dataStore = createStore()

  useCommand(dataStore, showPopover, withDomActions(new PopoverController()))

  for (const circle of testData) {
    dataStore.dispatch(use(addCircleRule(circle.center)))
  }

  renderToDOM(dataStore, document.getElementById("test-display")!, circles)

  // to deselect all circles
  document.querySelectorAll("circle").forEach(circle => {
    circle.dispatchEvent(new MouseEvent("mouseout", { bubbles: true }))
  })
}
