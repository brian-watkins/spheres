import { Context, behavior, effect, example, fact, step } from "esbehavior";
import { expect, resolvesTo } from "great-expectations";
import { TestAppController } from "helpers/testAppController.js";

export default (context: Context<TestAppController>) => behavior("bind", [
  (m) => m.pick() && example(context)
    .description("bind to an input field")
    .script({
      suppose: [
        fact("there is a view that binds state to an input field", async (controller) => {
          await controller.loadApp("bindInput.app")
        })
      ],
      perform: [
        step("a name is entered", async (context) => {
          await context.display.select("#nameInput").type("Cool Dude")
        })
      ],
      observe: [
        effect("the greeting is updated", async (context) => {
          await expect(context.display.select("[data-greeting]").text(),
            resolvesTo("Hello, Cool Dude!!!"))
        })
      ]
    }).andThen({
      perform: [
        step("the name is reset", async (context) => {
          await context.display.select("[data-reset-button]").click()
        })
      ],
      observe: [
        effect("the greeting display is reset", async (context) => {
          await expect(context.display.select("[data-greeting]").text(),
            resolvesTo("Hello, anyone?!"))
        }),
        effect("the input field value is updated", async (context) => {
          await expect(context.display.select("#nameInput").inputValue(),
            resolvesTo(""))
        })
      ]
    })

  // Should try binding to an element within a stateful view generator
  // and then when the bound input has some attributes set to the value
  // of a token fetched by the get function of the stateful view.

])