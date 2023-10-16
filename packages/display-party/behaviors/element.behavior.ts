import { behavior, Context, effect, example, fact } from "esbehavior";
import { equalTo, expect, is } from "great-expectations";
import { TestAppController } from "./helpers/testAppController.js";
import { theElementExists, theElementHasText } from "./helpers/effects.js";

export default (context: Context<TestAppController>) => behavior("View Elements", [
  example(context)
    .description("basic view element support")
    .script({
      suppose: [
        fact("there is a view with all the elements", async (controller) => {
          await controller.loadApp("elements.app")
        })
      ],
      observe: [
        theElementExists("DIV#funny-id"),
        theElementHasText("DIV[silly-attribute='joke']", "This is silly!"),
        theElementHasText("DIV P.super-class", "This is text"),
        theElementExists("h3[data-title]"),
        effect("an element with boolean attributes, checked and not disabled", async (context) => {
          const isChecked = await context.display.select("input[type='checkbox']").isChecked()
          expect(isChecked, is(equalTo(true)), "the element is checked")
          const isDisabled = await context.display.select("input[type='checkbox']").isDisabled()
          expect(isDisabled, is(equalTo(false)), "the element is enabled")
        }),
        theElementExists("button[aria-label='submit']")
      ]
    })
])
