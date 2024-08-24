import { behavior, effect, example, fact, step } from "esbehavior";
import { expect, resolvesTo } from "great-expectations";
import { browserAppContext } from "helpers/testAppController";

export default behavior("lists of views", [

  example(browserAppContext())
    .description("a view with a dynamic list of children")
    .script({
      suppose: [
        fact("there is a view with a dynamic list of children", async (context) => {
          await context.loadApp("listView.app")
        })
      ],
      observe: [
        effect("the views in the list are displayed", async (context) => {
          await expect(context.display.selectAll("li").map(el => el.text()), resolvesTo([
            "apple is at index 0",
            "grapes is at index 1",
            "dragonfruit is at index 2"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("the button is clicked to swap the last two elements", async (context) => {
          await context.display.select("[data-swap-elements]").click()
        })
      ],
      observe: [
        effect("the elements are swapped", async (context) => {
          await expect(context.display.selectAll("li").map(el => el.text()), resolvesTo([
            "apple is at index 0",
            "dragonfruit is at index 1",
            "grapes is at index 2"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("the button is clicked to rearrange the list elements", async (context) => {
          await context.display.select("[data-shift-elements]").click()
          await context.display.select("[data-shift-elements]").click()
        })
      ],
      observe: [
        effect("the elements are rearranged", async (context) => {
          await expect(context.display.selectAll("li").map(el => el.text()), resolvesTo([
            "grapes is at index 0",
            "apple is at index 1",
            "dragonfruit is at index 2"
          ]))
        })
      ]
    })

  // need an example where we start with nothing and then add items

])