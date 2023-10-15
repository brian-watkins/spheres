import { behavior, Context, effect, example, fact, step } from "esbehavior";
import { expect, resolvesTo } from "great-expectations";
import { TestAppController } from "./helpers/testAppController.js";

export default (context: Context<TestAppController>) => behavior("Select Element Properties", [

  example(context)
    .description("set default value of select element")
    .script({
      suppose: [
        fact("there is an app with an input that has a default value", async (controller) => {
          await controller.loadApp("select.app")
        })
      ],
      observe: [
        effect("grapes are selected", async (controller) => {
          await expect(controller.display.select("[data-message]").text(), resolvesTo("Selected Option: grapes"))
        })
      ]
    }).andThen({
      perform: [
        step("select another option", async (controller) => {
          await controller.display.select("select").selectOption("pear")
        })
      ],
      observe: [
        effect("pear is selected", async (controller) => {
          await expect(controller.display.select("[data-message]").text(), resolvesTo("Selected Option: pear"))
        })
      ]
    })

])