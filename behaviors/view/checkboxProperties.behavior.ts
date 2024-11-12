import { behavior, effect, example, fact, step } from "best-behavior";
import { expect, resolvesTo } from "great-expectations";
import { browserAppContext } from "./helpers/testAppController.js";

export default behavior("Checkbox Properties", [

  example(browserAppContext())
    .description("set checkboxes")
    .script({
      suppose: [
        fact("there is an app with an checkbox that is checked", async (controller) => {
          await controller.loadApp("checkbox.app")
        })
      ],
      observe: [
        effect("the third box is checked", async (controller) => {
          await expect(controller.display.selectAll("input[type='checkbox']").map(el => el.isChecked()), resolvesTo([
            false,
            false,
            true,
            false
          ]))
        }),
        effect("the message is updated", async (controller) => {
          await expect(controller.display.select("[data-message]").text(), resolvesTo("You checked: three"))
        })
      ]
    }).andThen({
      perform: [
        step("check different boxes", async (controller) => {
          await controller.display.selectWithText("one").click()
          await controller.display.selectWithText("four").click()
          await controller.display.selectWithText("three").click()
        }),
        step("submit the form", async (controller) => {
          await controller.display.select("[data-submit-button]").click()
        })
      ],
      observe: [
        effect("the first and last box are checked", async (controller) => {
          await expect(controller.display.selectAll("input[type='checkbox']").map(el => el.isChecked()), resolvesTo([
            true,
            false,
            false,
            true
          ]))
        }),
        effect("the message is updated", async (controller) => {
          await expect(controller.display.select("[data-message]").text(), resolvesTo("You checked: one, four"))
        })
      ]
    }).andThen({
      perform: [
        step("reset the state", async (controller) => {
          await controller.display.select("[data-reset-button]").click()
        })
      ],
      observe: [
        effect("the third box is checked", async (controller) => {
          await expect(controller.display.selectAll("input[type='checkbox']").map(el => el.isChecked()), resolvesTo([
            false,
            false,
            true,
            false
          ]))
        }),
        effect("the message is updated", async (controller) => {
          await expect(controller.display.select("[data-message]").text(), resolvesTo("You checked: three"))
        })
      ]
    })

])