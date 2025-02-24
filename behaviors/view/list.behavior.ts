import { behavior, effect, example, fact, step } from "best-behavior";
import { expect, resolvesTo } from "great-expectations";
import { browserAppContext } from "./helpers/testAppController";

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
    }),

  example(browserAppContext())
    .description("a view with a dynamic svg list")
    .script({
      suppose: [
        fact("there is a view with a dynamic svg list", async (context) => {
          await context.loadApp("svgList.app")
        })
      ],
      observe: [
        effect("the list is displayed", async (context) => {
          await expect(context.display.selectAll("[data-circle-button]").map(el => el.text()),
            resolvesTo([
              "apple",
              "grapes",
              "pizza"
            ])
          )
        })
      ]
    }).andThen({
      perform: [
        step("click a button to send to the front", async (context) => {
          await context.display.select("[data-circle-button='2']").click()
        })
      ],
      observe: [
        effect("the clicked item is first in the list", async (context) => {
          await expect(context.display.selectAll("[data-circle-button]").map(el => el.text()),
            resolvesTo([
              "pizza",
              "apple",
              "grapes"
            ])
          )
        })
      ]
    })

])