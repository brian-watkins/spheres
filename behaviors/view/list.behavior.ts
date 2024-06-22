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
            "apple",
            "grapes",
            "dragonfruit"
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
            "dragonfruit",
            "apple",
            "grapes"
          ]))
        })
      ]
    })

])