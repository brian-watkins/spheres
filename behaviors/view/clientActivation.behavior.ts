import { behavior, effect, example, fact, step } from "esbehavior";
import { arrayWith, assignedWith, equalTo, expect, is, stringContaining } from "great-expectations";
import { ssrTestAppContext } from "./helpers/testSSRServer.js";

export default behavior("client activation of server rendered views", [

  example(ssrTestAppContext())
    .description("rendered content before activating the island")
    .script({
      suppose: [
        fact("the app is loaded in the browser", async (context) => {
          context.server.setContent({
            template: "../fixtures/ssrApp/renderOnly/template.html",
            view: "./behaviors/view/fixtures/ssrApp/basic/server.ts"
          })
          await context.browser.loadApp()
        }),
      ],
      observe: [
        effect("the default state from the server is loaded", async (context) => {
          const clickText = await context.browser.display.select("[data-click-count]").text()
          expect(clickText, is(equalTo("You've clicked the button 0 times!")))
        })
      ]
    }),

  example(ssrTestAppContext())
    .description("simple app with multiple islands sharing state, some of the same element")
    .script({
      suppose: [
        fact("the app is loaded in the browser", async (context) => {
          context.server.setContent({
            template: "../fixtures/ssrApp/basic/template.html",
            view: "./behaviors/view/fixtures/ssrApp/basic/server.ts"
          })
          await context.browser.loadApp()
        })
      ],
      observe: [
        effect("the default state from the server is loaded", async (context) => {
          const clickText = await context.browser.display.select("[data-click-count]").text()
          expect(clickText, is(equalTo("You've clicked the button 0 times!")))
        })
      ]
    }).andThen({
      perform: [
        step("the button is clicked three times", async (context) => {
          await context.browser.display.select("button").click()
          await context.browser.display.select("button").click()
          await context.browser.display.select("button").click()
        })
      ],
      observe: [
        effect("both click tally islands are updated", async (context) => {
          const counterTexts = await context.browser.display.selectAll("[data-click-count]").map(el => el.text())
          expect(counterTexts, is(arrayWith([
            stringContaining("3 times"),
            stringContaining("3 times"),
          ])))
        })
      ]
    }),

  example(ssrTestAppContext())
    .description("simple app with multiple stores")
    .script({
      suppose: [
        fact("the app is loaded in the browser", async (context) => {
          context.server.setContent({
            template: "../fixtures/ssrApp/multipleStores/template.html",
            view: "./behaviors/view/fixtures/ssrApp/multipleStores/server.ts"
          })
          await context.browser.loadApp()
        })
      ],
      observe: [
        effect("the default state from the server is loaded", async (context) => {
          const clickText = await context.browser.display.select("#fragment-a [data-click-count]").text()
          expect(clickText, is(equalTo("You've clicked the button 0 times!")))
          const secondClickText = await context.browser.display.select("#fragment-b [data-click-count]").text()
          expect(secondClickText, is(equalTo("You've clicked the button 0 times!")))
        })
      ]
    }).andThen({
      perform: [
        step("the buttons are clicked times", async (context) => {
          await context.browser.display.select("#fragment-a button").click()
          await context.browser.display.select("#fragment-b button").click()
          await context.browser.display.select("#fragment-a button").click()
        })
      ],
      observe: [
        effect("both click tally islands are updated", async (context) => {
          const counterText = await context.browser.display.select("#fragment-a [data-click-count]").text()
          expect(counterText, is(stringContaining("2 times")))
          const secondCounterText = await context.browser.display.select("#fragment-b [data-click-count]").text()
          expect(secondCounterText, is(stringContaining("1 times")))
        }),
        effect("both nodes are independently updated", async (context) => {
          const fragAIsEven = await context.browser.display.select("#fragment-a [data-click-count]").attribute("data-isEven")
          expect(fragAIsEven, is(assignedWith(equalTo("true"))))
          const fragBIsEven = await context.browser.display.select("#fragment-b [data-click-count]").attribute("data-isEven")
          expect(fragBIsEven, is<string | undefined>(undefined))
        })
      ]
    }),

  example(ssrTestAppContext())
    .description("app with nested islands sharing state, some of the same view")
    .script({
      suppose: [
        fact("the app is loaded in the browser", async (context) => {
          context.server.setContent({
            template: "../fixtures/ssrApp/nested/template.html",
            view: "./behaviors/view/fixtures/ssrApp/nested/server.ts"
          })
          await context.browser.loadApp()
        })
      ],
      observe: [
        effect("the default state from the server is loaded", async (context) => {
          const clickText = await context.browser.display.select("[data-click-count]").text()
          expect(clickText, is(equalTo("You've clicked the button 0 times!")))
        })
      ]
    }).andThen({
      perform: [
        step("the button is clicked three times", async (context) => {
          await context.browser.display.select("button").click()
          await context.browser.display.select("button").click()
          await context.browser.display.select("button").click()
        })
      ],
      observe: [
        effect("both click tally islands are updated", async (context) => {
          const counterTexts = await context.browser.display.selectAll("[data-click-count]").map(el => el.text())
          expect(counterTexts, is(arrayWith([
            stringContaining("3 times"),
            stringContaining("3 times"),
          ])))
        }),
        effect("both tally islands are missing the isEven data attribute", async (context) => {
          const isEvenAttrs = await context.browser.display.selectAll("[data-click-count]").map(el => el.attribute("data-isEven"))
          expect(isEvenAttrs, is(arrayWith([
            equalTo<string | undefined>(undefined),
            equalTo<string | undefined>(undefined)
          ])))
        })
      ]
    }),

  example(ssrTestAppContext())
    .description("app with view fragments nested under the island")
    .script({
      suppose: [
        fact("the app is loaded in the browser", async (context) => {
          context.server.setContent({
            template: "../fixtures/ssrApp/islandWithState/template.html",
            view: "./behaviors/view/fixtures/ssrApp/islandWithState/server.ts"
          })
          await context.browser.loadApp()
        })
      ],
      observe: [
        effect("the default state from the server is loaded", async (context) => {
          const clickText = await context.browser.display.select("[data-click-count]").text()
          expect(clickText, is(equalTo("You've clicked the button 0 times!")))
        })
      ]
    }).andThen({
      perform: [
        step("the button is clicked three times", async (context) => {
          await context.browser.display.select("button").click()
          await context.browser.display.select("button").click()
          await context.browser.display.select("button").click()
        })
      ],
      observe: [
        effect("both click tally islands are updated", async (context) => {
          const counterTexts = await context.browser.display.selectAll("[data-click-count]").map(el => el.text())
          expect(counterTexts, is(arrayWith([
            stringContaining("3 times"),
            stringContaining("3 times"),
          ])))
        })
      ]
    })

])