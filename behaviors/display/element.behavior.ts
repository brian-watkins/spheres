import { behavior, Context, effect, example, fact, Observation } from "esbehavior";
import { equalTo, expect, is } from "great-expectations";
import { TestAppController } from "./helpers/testAppController.js";

export default (context: Context<TestAppController>) => behavior("View Elements", [
  example(context)
    .description("basic view element support")
    .script({
      suppose: [
        fact("there is a view with all the elements", async (controller) => {
          await controller.loadApp("element.app")
        })
      ],
      observe: [
        theElementExists("DIV"),
        theElementExists("ARTICLE"),
        theElementExists("P"),
        theElementExists("H1"),
        theElementExists("HR"),
        theElementExists("UL"),
        theElementExists("LI"),
        theElementExists("INPUT"),
        theElementExists("BUTTON"),
        theElementExists("some-custom-element"),
        theElementExists("TEXTAREA")
      ]
    })
])

function theElementExists(tag: string): Observation<TestAppController> {
  return effect(`there is a ${tag} element`, async (context) => {
    const hasElement = await context.display.select(tag).exists()
    expect(hasElement, is(equalTo(true)))
  })
}