import { behavior, Context, effect, example, fact, step } from "esbehavior";
import { expect, resolvesTo } from "great-expectations";
import { TestAppController } from "./helpers/testAppController.js";

export default (context: Context<TestAppController>) => behavior("Select Element Properties", [

  example(context)
    .description("set selected option of select element")
    .script({
      suppose: [
        fact("there is an app with a select that has an option selected", async (controller) => {
          await controller.loadApp("select.app")
        })
      ],
      observe: [
        effect("the grapes option is selected", async (controller) => {
          await expect(controller.display.select("select").inputValue(), resolvesTo("grapes"))
        }),
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
        effect("the pear option is selected", async (controller) => {
          await expect(controller.display.select("select").inputValue(), resolvesTo("pear"))
        }),
        effect("the message is updated", async (controller) => {
          await expect(controller.display.select("[data-message]").text(), resolvesTo("Selected Option: pear"))
        })
      ]
    }).andThen({
      perform: [
        step("reset the state", async (controller) => {
          await controller.display.select("[data-reset-button]").click()
        })
      ],
      observe: [
        effect("the grapes option is selected", async (controller) => {
          await expect(controller.display.select("select").inputValue(), resolvesTo("grapes"))
        }),
        effect("the message is updated", async (controller) => {
          await expect(controller.display.select("[data-message]").text(), resolvesTo("Selected Option: grapes"))
        })
      ]
    })

])