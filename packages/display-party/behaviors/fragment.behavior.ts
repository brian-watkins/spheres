import { Context, behavior, example, fact, step } from "esbehavior";
import { theElementExists, theElementHasText } from "./helpers/effects.js";
import { TestAppController } from "./helpers/testAppController.js";

export default (context: Context<TestAppController>) => behavior("View fragment", [
  example(context)
    .description("the root view is a fragment")
    .script({
      suppose: [
        fact("there is a view that is a fragment", async (context) => {
          await context.loadApp("fragment.app")
        })
      ],
      observe: [
        theElementExists("h1"),
        theElementExists("hr"),
        theElementExists("article"),
        theElementHasText("article p[data-order='first']", "And this is a paragraph of text."),
        theElementHasText("article p[data-order='second']", "And this is another paragraph of text."),
        theElementExists("footer"),
      ]
    }),
  example(context)
    .description("the view contains a stateful view that is a fragment")
    .script({
      suppose: [
        fact("there is a view that is a fragment", async (context) => {
          await context.loadApp("nestedFragment.app")
        })
      ],
      observe: [
        theElementHasText("section p[data-order='first']", "This is the first paragraph"),
        theElementHasText("section p[data-order='second']", "This is the second paragraph"),
        theElementHasText("section p[data-order='third']", "Written by: Cool Dude"),
      ]
    }).andThen({
      perform: [
        step("the name is updated", async (context) => {
          await context.display.select("input").type("Awesome Person")
        })
      ],
      observe: [
        theElementHasText("section p[data-order='first']", "This is the first paragraph"),
        theElementHasText("section p[data-order='second']", "This is the second paragraph"),
        theElementHasText("section p[data-order='third']", "Written by: Awesome Person"),
      ]
    })
])