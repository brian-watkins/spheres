import { behavior, effect, example, fact, step } from "best-behavior";
import { expect, is, resolvesTo, stringContaining } from "great-expectations";
import { browserAppContext } from "./helpers/testAppController.js";


export default behavior("view events", [
  example(browserAppContext())
    .description("counting clicks with local state")
    .script({
      suppose: [
        fact("there is a view that depends on click count", async (controller) => {
          await controller.loadApp("clickCounter.app")
        })
      ],
      perform: [
        step("the button is clicked three times", async (controller) => {
          await controller.display.select("button").click()
          await controller.display.select("button").click()
          await controller.display.select("button").click()
        })
      ],
      observe: [
        effect("the click counter is updated", async (context) => {
          const counterText = await context.display.select("[data-click-count]").text()
          expect(counterText, is(stringContaining("3 times")))
        })
      ]
    }),

  example(browserAppContext())
    .description("event listener for custom event")
    .script({
      suppose: [
        fact("there is a view that depends on a custom event", async (controller) => {
          await controller.loadApp("customEvent.app")
        })
      ],
      perform: [
        step("click the button", async (controller) => {
          await controller.display.select("button").click()
        })
      ],
      observe: [
        effect("the message is received", async (controller) => {
          await expect(controller.display.select("[data-message]").text(), resolvesTo("Message: This is a cool, secret message!"))
        })
      ]
    })

])