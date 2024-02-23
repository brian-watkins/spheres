import { behavior, effect, example, fact, step } from "esbehavior";
import { expect, is, resolvesTo } from "great-expectations";
import { browserAppContext } from "helpers/testAppController";

export default behavior("zone", [

  example(browserAppContext())
    .description("a zone with a template and context")
    .script({
      suppose: [
        fact("there is a view with a template", async (controller) => {
          await controller.loadApp("zone.app")
        })
      ],
      observe: [
        effect("the template is rendered with the first context", async (controller) => {
          const text = await controller.display.select("[data-greeting='1']").text()
          expect(text, is("Hello, Cool dude!"))
        }),
        effect("the template is rendered with the second context", async (controller) => {
          const text = await controller.display.select("[data-greeting='2']").text()
          expect(text, is("Hello, Awesome person!"))
        }),
        effect("the template is rendered with the third context", async (controller) => {
          const text = await controller.display.select("[data-greeting='3']").text()
          expect(text, is("Hello, Fun human!"))
        })
      ]
    }).andThen({
      perform: [
        step("click the second counter", async (context) => {
          await context.display.select("[data-increment-counter='2']").click()
          await context.display.select("[data-increment-counter='2']").click()
          await context.display.select("[data-increment-counter='2']").click()
        }),
        step("click the third counter", async (context) => {
          await context.display.select("[data-increment-counter='3']").click()
          await context.display.select("[data-increment-counter='3']").click()
        })
      ],
      observe: [
        effect("the click counter does not increment for the first zone", async (context) => {
          await expect(context.display.select("[data-counter='1']").text(), resolvesTo("0 clicks!"))
        }),
        effect("the click counter increments for the second zone", async (context) => {
          await expect(context.display.select("[data-counter='2']").text(), resolvesTo("3 clicks!"))
        }),
        effect("the click counter increments for the third zone", async (context) => {
          await expect(context.display.select("[data-counter='3']").text(), resolvesTo("2 clicks!"))
        })
      ]
    })

])