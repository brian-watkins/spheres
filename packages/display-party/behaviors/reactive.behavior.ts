import { Context, behavior, effect, example, fact, step } from "esbehavior";
import { assignedWith, equalTo, expect, is, stringContaining } from "great-expectations";
import { TestAppController } from "helpers/testAppController.js";

export default (context: Context<TestAppController>) => behavior("reactive elements", [
  
  example(context)
    .description("reactive text")
    .script({
      suppose: [
        fact("there is a view with reactive text", async (controller) => {
          await controller.loadApp("reactiveCounter.app")
        })
      ],
      perform: [
        step("the button is clicked three times", async (controller) => {
          await controller.display.select("button").click()
          await controller.display.select("button").click()
          await controller.display.select("button").click()
          await controller.display.select("button").click()
        })
      ],
      observe: [
        effect("the click counter is updated", async (context) => {
          const counterText = await context.display.select("[data-click-count]").text()
          expect(counterText, is(stringContaining("4 times")))
        })
      ]
    }),

  example(context)
    .description("reactive attributes")
    .script({
      suppose: [
        fact("there is a view with reactive attributes", async (controller) => {
          await controller.loadApp("reactiveAttributes.app")
        })
      ],
      perform: [
        step("click the button", async (controller) => {
          await controller.display.select("button").click()
        })
      ],
      observe: [
        effect("the classes change", async (controller) => {
          const classes = await controller.display.select("#title").attribute("class")
          expect(classes, is(assignedWith(equalTo("off"))))
        })
      ]
    }).andThen({
      perform: [
        step("click the button", async (controller) => {
          await controller.display.select("button").click()
        })
      ],
      observe: [
        effect("the classes change again", async (controller) => {
          const classes = await controller.display.select("#title").attribute("class")
          expect(classes, is(assignedWith(equalTo("on"))))
        })
      ]
    })
  
])