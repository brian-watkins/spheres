import { behavior, effect, example, fact, step } from "best-behavior";
import { arrayWith, assignedWith, equalTo, expect, is, resolvesTo, stringContaining } from "great-expectations";
import { ssrTestAppContext } from "./helpers/testSSRServer";

export default behavior("client activation of server rendered views", [

  example(ssrTestAppContext())
    .description("rendered content before activating the island")
    .script({
      suppose: [
        fact("the app is loaded in the browser", async (context) => {
          context.server.setSSRApp({
            template: "../fixtures/ssrApp/renderOnly/template.html",
            view: "./behaviors/server/fixtures/ssrApp/basic/server.ts"
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
          context.server.setSSRApp({
            template: "../fixtures/ssrApp/basic/template.html",
            view: "./behaviors/server/fixtures/ssrApp/basic/server.ts"
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
          context.server.setSSRApp({
            template: "../fixtures/ssrApp/multipleStores/template.html",
            view: "./behaviors/server/fixtures/ssrApp/multipleStores/server.ts"
          })
          await context.browser.loadApp()
        })
      ],
      observe: [
        effect("the default state from the server is loaded", async (context) => {
          const clickText = await context.browser.display.select("#fragment-a [data-click-count]").text()
          expect(clickText, is(equalTo("You've clicked the button 4 times!")))
          const secondClickText = await context.browser.display.select("#fragment-b [data-click-count]").text()
          expect(secondClickText, is(equalTo("You've clicked the button 2 times!")))
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
          expect(counterText, is(stringContaining("6 times")))
          const secondCounterText = await context.browser.display.select("#fragment-b [data-click-count]").text()
          expect(secondCounterText, is(stringContaining("3 times")))
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
          context.server.setSSRApp({
            template: "../fixtures/ssrApp/nested/template.html",
            view: "./behaviors/server/fixtures/ssrApp/nested/server.ts"
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
    .description("app with stateful list to activate")
    .script({
      suppose: [
        fact("the app is loaded in the browser", async (context) => {
          context.server.setSSRApp({
            template: "../fixtures/ssrApp/islandWithList/template.html",
            view: "./behaviors/server/fixtures/ssrApp/islandWithList/server.ts"
          })
          await context.browser.loadApp()
        })
      ],
      observe: [
        effect("the default list is loaded", async (context) => {
          await expect(context.browser.display.selectAll("[data-item-name]").map(el => el.text()), resolvesTo([
            "Apple, red",
            "Banana, yellow"
          ]))
        }),
        effect("the title is set with the server-side supplied value", async (context) => {
          await expect(context.browser.display.select("[data-title]").text(), resolvesTo("Fun Stuff!"))
        })
      ]
    }).andThen({
      perform: [
        step("delete a server-rendered item", async (context) => {
          await context.browser.display.select("[data-delete-item='Apple']").click()
        })
      ],
      observe: [
        effect("the item is deleted", async (context) => {
          await expect(context.browser.display.selectAll("[data-item-name]").map(el => el.text()), resolvesTo([
            "Banana, yellow"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("create an item", async (context) => {
          await context.browser.display.select("input[name='item-name']").type("Dust")
          await context.browser.display.select("input[name='item-color']").type("gray")
          await context.browser.display.selectWithText("Save Item").click()
        })
      ],
      observe: [
        effect("the list is updated with the new item", async (context) => {
          await expect(context.browser.display.selectAll("[data-item-name]").map(el => el.text()), resolvesTo([
            "Dust, gray",
            "Banana, yellow"
          ]))
        })
      ]
    }),

  example(ssrTestAppContext())
    .description("app with view fragments nested under the island")
    .script({
      suppose: [
        fact("the app is loaded in the browser", async (context) => {
          context.server.setSSRApp({
            template: "../fixtures/ssrApp/islandWithState/template.html",
            view: "./behaviors/server/fixtures/ssrApp/islandWithState/server.ts"
          })
          await context.browser.loadApp()
        })
      ],
      observe: [
        effect("the default state from the server is loaded", async (context) => {
          const counters = context.browser.display.selectAll("[data-click-count='0']")
          await expect(counters.map(el => el.text()), resolvesTo(equalTo([
            "You've clicked the button 0 times!",
            "You've clicked the button 0 times!"
          ])))
          await expect(counters.map(el => el.classes()), resolvesTo([
            ["even-style"],
            ["even-style"]
          ]))
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
          const counters = context.browser.display.selectAll("[data-click-count='3']")
          await expect(counters.map(el => el.text()), resolvesTo(equalTo([
            "You've clicked the button 3 times!",
            "You've clicked the button 3 times!"
          ])))
          await expect(counters.map(el => el.classes()), resolvesTo([
            ["odd-style"],
            ["odd-style"]
          ]))
        })
      ]
    }),

  example(ssrTestAppContext())
    .description("ssr view with container with update and onRegister hook in store")
    .script({
      suppose: [
        fact("the app is loaded in the browser", async (context) => {
          context.server.setSSRApp({
            template: "../fixtures/ssrApp/islandWithUpdate/template.html",
            view: "./behaviors/server/fixtures/ssrApp/islandWithUpdate/server.ts"
          })
          await context.browser.loadApp()
        })
      ],
      observe: [
        effect("the default value is set on the input element", async (context) => {
          await expect(context.browser.display.select("[data-item-input]").inputValue(), resolvesTo("provided by server"))
        })
      ]
    }).andThen({
      perform: [
        step("add a new item to the list", async (context) => {
          await context.browser.display.select("[data-item-input]").type("Super Cool Thing", { clear: true })
          await context.browser.display.select("[data-item-submit]").click()
        })
      ],
      observe: [
        effect("the server-rendered list is updated", async (context) => {
          await expect(context.browser.display.selectAll("LI").texts(),
            resolvesTo([
              "Item-1",
              "Item-2",
              "Item-3",
              "Super Cool Thing"
            ]))
        })
      ]
    })

])