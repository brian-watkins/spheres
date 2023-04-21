import { behavior, effect, example, fact, step } from "esbehavior";
import { arrayWith, equalTo, expect, is, stringContaining } from "great-expectations";
import { ssrTestAppContext } from "./helpers/testServer.js";
import { Browser } from "playwright";

export default (browser: Browser, debug: boolean) => behavior("client activation of server rendered views", [
  example(ssrTestAppContext(browser, debug))
    .description("rendered content before activating the island")
    .script({
      suppose: [
        fact("the app is loaded in the browser", async (context) => {
          await context.server.start({
            template: "../fixtures/ssrApp/renderOnly/template.html",
            view: "./behaviors/display/fixtures/ssrApp/basic/view.ts"
          })
          await context.browser.start()
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
  example(ssrTestAppContext(browser, debug))
    .description("simple app with multiple islands sharing state, some of the same element")
    .script({
      suppose: [
        fact("the app is loaded in the browser", async (context) => {
          await context.server.start({
            template: "../fixtures/ssrApp/basic/template.html",
            view: "./behaviors/display/fixtures/ssrApp/basic/view.ts"
          })
          await context.browser.start()
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
  example(ssrTestAppContext(browser, debug))
    .description("app with nested islands sharing state, some of the same element")
    .script({
      suppose: [
        fact("the app is loaded in the browser", async (context) => {
          await context.server.start({
            template: "../fixtures/ssrApp/nested/template.html",
            view: "./behaviors/display/fixtures/ssrApp/nested/view.ts"
          })
          await context.browser.start()
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
  example(ssrTestAppContext(browser, debug))
    .description("app with view fragments nested under the island")
    .script({
      suppose: [
        fact("the app is loaded in the browser", async (context) => {
          await context.server.start({
            template: "../fixtures/ssrApp/islandWithState/template.html",
            view: "./behaviors/display/fixtures/ssrApp/islandWithState/view.ts"
          })
          await context.browser.start()
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