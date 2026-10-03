import { behavior, effect, example, fact, step } from "best-behavior"
import { expect, resolvesTo } from "great-expectations"
import { browserAppContext } from "./helpers/testAppController.js"

export default behavior("Textarea Element", [
  example(browserAppContext())
    .description("static value")
    .script({
      suppose: [
        fact("there is an app with a textarea that has a static value", async (controller) => {
          await controller.loadApp("textarea.app")
        }),
      ],
      observe: [
        effect("the textarea contains the value", async (controller) => {
          await expect(
            controller.display.select("textarea").inputValue(),
            resolvesTo("Some static content!"),
          )
        }),
      ],
    }),

  example(browserAppContext())
    .description("reactive value")
    .script({
      suppose: [
        fact(
          "there is an app with a textarea whose value is controlled by state",
          async (controller) => {
            await controller.loadApp("statefulTextarea.app")
          },
        ),
      ],
      observe: [
        effect("the textarea contains the initial state", async (controller) => {
          await expect(
            controller.display.select("textarea").inputValue(),
            resolvesTo("Some initial content!"),
          )
        }),
      ],
    })
    .andThen({
      perform: [
        step("the state is updated", async (controller) => {
          await controller.display.select("button").click()
        }),
      ],
      observe: [
        effect("the textarea contains the updated state", async (controller) => {
          await expect(
            controller.display.select("textarea").inputValue(),
            resolvesTo("SOME INITIAL CONTENT!"),
          )
        }),
      ],
    })
    .andThen({
      perform: [
        step("new content is typed into the textarea", async (controller) => {
          await controller.display.select("textarea").type("Fun stuff!", { clear: true })
        }),
        step("the state is updated", async (controller) => {
          await controller.display.select("button").click()
        }),
      ],
      observe: [
        effect(
          "the textarea contains the state derived from the typed content",
          async (controller) => {
            await expect(
              controller.display.select("textarea").inputValue(),
              resolvesTo("FUN STUFF!"),
            )
          },
        ),
      ],
    }),
])
