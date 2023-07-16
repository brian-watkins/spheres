import { ConfigurableExample, Context, behavior, effect, example, fact } from "esbehavior"
import { equalTo, expect, is } from "great-expectations"
import { TestAppController } from "helpers/testAppController.js"


const simpleTemplateBehavior = (context: Context<TestAppController>): ConfigurableExample =>
  (m) => m.pick() && example(context)
    .description("Rendering a simple view")
    .script({
      suppose: [
        fact("a view with a template is provided", async (controller) => {
          await controller.loadApp("template.app")
        })
      ],
      observe: [
        effect("it displays all the rows", async (controller) => {
          const rowCount = await controller.display.selectAll("[data-item-row]").count()
          expect(rowCount, is(equalTo(100)))
        })
      ]
    })

export default (context: Context<TestAppController>) => behavior("template", [
  simpleTemplateBehavior(context)
])