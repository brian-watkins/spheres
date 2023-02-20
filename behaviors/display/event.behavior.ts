import { behavior, Context, effect, example, fact, step } from "esbehavior";
import { expect, is, stringContaining } from "great-expectations";
import { TestAppController } from "./helpers/testAppController.js";


export default (context: Context<TestAppController>) => behavior("view events", [
  example(context)
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
    })
])