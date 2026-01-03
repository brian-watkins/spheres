import { behavior, effect, example, fact, step } from "best-behavior";
import { expect, resolvesTo } from "great-expectations";
import { browserAppContext } from "./helpers/testAppController";

export default behavior("Checkbox Properties", [

  example(browserAppContext())
    .description("rendering a custom element")
    .script({
      suppose: [
        fact("there is an app with a custom element", async (controller) => {
          await controller.loadApp("customElement.app")
        })
      ],
      observe: [
        effect("the element is rendered", async (controller) => {
          await expect(controller.display.select("cool-element").exists(), resolvesTo(true))
        })
      ]
    }).andThen({
      perform: [
        step("click the custom element button", async (controller) => {
          await controller.display.selectWithText("Please click me!").click()
        })
      ],
      observe: [
        effect("the custom event is fired and handled", async (controller) => {
          await expect(controller.display.select("[data-message]").text(), resolvesTo("camels"))
        })
      ]
    }).andThen({
      perform: [
        step("Click a custom element that bubbles the event", async (controller) => {
          await controller.display.select("uncool-element div").click()
        })
      ],
      observe: [
        effect("the click event is handled outside the custom element", async (controller) => {
          await expect(controller.display.select("[data-message]").text(), resolvesTo("camels !!!"))
        })
      ]
    })

])