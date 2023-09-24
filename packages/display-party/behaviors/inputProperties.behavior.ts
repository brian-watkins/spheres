import { behavior, Context, effect, example, fact, step } from "esbehavior";
import { equalTo, expect, is, resolvesTo } from "great-expectations";
import { InputAppProps } from "./fixtures/input.app.js";
import { TestAppController } from "./helpers/testAppController.js";

export default (context: Context<TestAppController>) => behavior("Input Element Properties", [
  example(context)
    .description("default value")
    .script({
      suppose: [
        fact("there is an app with an input that has a default value", async (controller) => {
          await controller.loadApp<InputAppProps>("input.app", {
            defaultInputValue: "my default value"
          })
        })
      ],
      observe: [
        effect("the default value is set", async (controller) => {
          const valueAttribute = await controller.display.select("input[data-with-default]").inputValue()
          expect(valueAttribute, is((equalTo("my default value"))))
        }),
        effect("the enabled input is enabled", async (controller) => {
          const isDisabled = await controller.display.select("input[data-with-default]").isDisabled()
          expect(isDisabled, is(equalTo(false)))
        }),
        effect("the disabled input is disabled", async (controller) => {
          const isDisabled = await controller.display.select("input[data-disabled]").isDisabled()
          expect(isDisabled, is(equalTo(true)))
        })
      ]
    }),

  example(context)
    .description("reactive input value")
    .script({
      suppose: [
        fact("there is a view with a reactive input value", async (controller) => {
          await controller.loadApp("statefulInput.app")
        })
      ],
      observe: [
        effect("the initial value is displayed", async (controller) => {
          await expect(controller.display.select("input").inputValue(), resolvesTo("17"))
        })
      ]
    }).andThen({
      perform: [
        step("the container is updated", async (controller) => {
          await controller.display.select("button").click()
          await controller.display.select("button").click()
        })
      ],
      observe: [
        effect("the input value is updated", async (controller) => {
          await expect(controller.display.select("input").inputValue(), resolvesTo("19"))
        })
      ]
    })
])