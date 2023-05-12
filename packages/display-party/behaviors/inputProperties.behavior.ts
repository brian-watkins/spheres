import { behavior, Context, effect, example, fact } from "esbehavior";
import { assignedWith, equalTo, expect, is } from "great-expectations";
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
          const valueAttribute = await controller.display.select("input[data-with-default]").attribute("value")
          expect(valueAttribute, is(assignedWith(equalTo("my default value"))))
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
    })
])