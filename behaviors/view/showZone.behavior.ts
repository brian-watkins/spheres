import { behavior, effect, example, fact, step } from "best-behavior";
import { expect, resolvesTo } from "great-expectations";
import { browserAppContext } from "./helpers/testAppController";


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
        effect("the happy view is present", async (context) => {
          await expect(context.display.select("[data-happy-view]").exists(), resolvesTo(true))
        }),
        effect("the fun view is not present", async (context) => {
          await expect(context.display.select("[data-fun-view]").exists(), resolvesTo(false))
        })
      ]
    }).andThen({
      perform: [
        step("toggle the view", async (context) => {
          await context.display.select("[data-toggle]").click()
        })
      ],
      observe: [
        effect("the happy view is not present", async (context) => {
          await expect(context.display.select("[data-happy-view]").exists(), resolvesTo(false))
        }),
        effect("the fun view is present", async (context) => {
          await expect(context.display.select("[data-fun-view]").exists(), resolvesTo(true))
        })
      ]
    }).andThen({
      perform: [
        step("click the counter button", async (context) => {
          await context.display.select("[data-fun-counter]").click()
          await context.display.select("[data-fun-counter]").click()
          await context.display.select("[data-fun-counter]").click()
        })
      ],
      observe: [
        effect("the fun counter updates", async (context) => {
          await expect(context.display.select("[data-total-fun]").text(), resolvesTo("Total fun clicks: 3"))
        }),
        effect("the happy counter does not update", async (context) => {
          await expect(context.display.select("[data-total-happy]").text(), resolvesTo("Total happy clicks: 0"))
        })
      ]
    }).andThen({
      perform: [
        step("toggle the view", async (context) => {
          await context.display.select("[data-toggle]").click()
        }),
        step("click the happy counter", async (context) => {
          await context.display.select("[data-happy-counter]").click()
        })
      ],
      observe: [
        effect("the happy view is present", async (context) => {
          await expect(context.display.select("[data-happy-view]").exists(), resolvesTo(true))
        }),
        effect("the fun view is not present", async (context) => {
          await expect(context.display.select("[data-fun-view]").exists(), resolvesTo(false))
        }),
        effect("the happy counter updates", async (context) => {
          await expect(context.display.select("[data-total-happy]").text(), resolvesTo("Total happy clicks: 1"))
        }),
        effect("other elements before and after the toggleable view are still present", async (context) => {
          await expect(context.display.selectAll("hr").count(), resolvesTo(2))
        })
      ]
    }),

  example(browserAppContext())
    .description("showing and hiding a view at the root of a template")
    .script({
      suppose: [
        fact("there is a view", async (context) => {
          await context.loadApp("showHideTemplate.app")
        })
      ],
      observe: [
        effect("the views show the templatized text", async (context) => {
          await expect(context.display.selectAll("[data-toggleable-view]").map(el => el.text()), resolvesTo([
            "You are cool!",
            "You are awesome!",
            "You are fun!",
            "You are great!",
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("click to hide the views", async (context) => {
          await context.display.select("[data-toggle-button]").click()
        })
      ],
      observe: [
        effect("the toggleable views are hidden", async (context) => {
          await expect(context.display.selectAll("[data-toggleable-view]").count(), resolvesTo(0))
        })
      ]
    }).andThen({
      perform: [
        step("click to show the views", async (context) => {
          await context.display.select("[data-toggle-button]").click()
        })
      ],
      observe: [
        effect("the views are shown with the templatized text", async (context) => {
          await expect(context.display.selectAll("[data-toggleable-view]").map(el => el.text()), resolvesTo([
            "You are cool!",
            "You are awesome!",
            "You are fun!",
            "You are great!",
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("delete one of the items", async (context) => {
          await context.display.select("[data-delete-button='fun']").click()
        }),
        step("delete another item", async (context) => {
          await context.display.select("[data-delete-button='awesome']").click()
        })
      ],
      observe: [
        effect("the event is handled correctly and the items are removed", async (context) => {
          await expect(context.display.selectAll("[data-toggleable-view]").map(el => el.text()), resolvesTo([
            "You are cool!",
            "You are great!"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("toggle the views", async (context) => {
          await context.display.select("[data-toggle-button]").click()
        })
      ],
      observe: [
        effect("the toggleable views are hidden", async (context) => {
          await expect(context.display.selectAll("[data-toggleable-view]").count(), resolvesTo(0))
        })
      ]
    })

])