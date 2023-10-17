import { Context, behavior, effect, example, fact, step } from "esbehavior";
import { expect, resolvesTo } from "great-expectations";
import { TestAppController } from "helpers/testAppController";

export default (context: Context<TestAppController>) => behavior("Checkbox Properties", [

  example(context)
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
    })

])