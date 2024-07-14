import { behavior, effect, example, fact, step } from "esbehavior";
import { expect, resolvesTo } from "great-expectations";
import { browserAppContext } from "helpers/testAppController";


export default behavior("show and hide zone", [

  example(browserAppContext())
    .description("a view that shows and hides a child view")
    .script({
      suppose: [
        fact("there is a view", async (context) => {
          await context.loadApp("showHideView.app")
        })
      ],
      observe: [
        effect("the toggleable view is not present", async (context) => {
          await expect(context.display.select("[data-toggleable-view]").exists(), resolvesTo(false))
        })
      ]
    }).andThen({
      perform: [
        step("toggle the view", async (context) => {
          await context.display.select("button").click()
        })
      ],
      observe: [
        effect("the toggleable view is present", async (context) => {
          await expect(context.display.select("[data-toggleable-view]").exists(), resolvesTo(true))
        })
      ]
    }).andThen({
      perform: [
        step("toggle the view", async (context) => {
          await context.display.select("button").click()
        })
      ],
      observe: [
        effect("the toggleable view is not present", async (context) => {
          await expect(context.display.select("[data-toggleable-view]").exists(), resolvesTo(false))
        }),
        effect("other elements before and after the toggleable view are still present", async (context) => {
          await expect(context.display.selectAll("hr").count(), resolvesTo(2))
        })
      ]
    })
  
])