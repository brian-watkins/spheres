import { behavior, Context, effect, example, fact, step } from "esbehavior";
import { equalTo, expect, is } from "great-expectations";
import { TestAppController } from "./helpers/testAppController.js";


export default (context: Context<TestAppController>) => behavior("css attributes on view", [
  example(context)
    .description("View with dynamic css attributes")
    .script({
      suppose: [
        fact("there is a view with local state", async (controller) => {
          await controller.loadApp("css.app")
        })
      ],
      observe: [
        effect("the main view has the expected css", async (controller) => {
          const classes = await controller.display.select("h1").classes()
          expect(classes, is(equalTo(["super-title"])))
        }),
        effect("the odd css class is present", async (controller) => {
          const classes = await controller.display.select("#cool-stuff").classes()
          expect(classes, is(equalTo([
            "zoom",
            "odd"
          ])))
        })
      ]
    })
    .andThen({
      perform: [
        step("the state is updated", async (controller) => {
          await controller.display.select("[data-number-input]").type("24", { clear: true })
        })
      ],
      observe: [
        effect("the css class list is updated", async (controller) => {
          const classes = await controller.display.select("#cool-stuff").classes()
          expect(classes, is(equalTo([
            "zoom",
            "even"
          ])))
        })
      ]
    })
])