import { behavior, effect, example, fact, step } from "esbehavior";
import { equalTo, expect, is, stringContaining } from "great-expectations";
import { ssrTestAppContext } from "./helpers/testServer.js";
import { Browser } from "playwright";

export default (browser: Browser, debug: boolean) => behavior("client activation of server rendered views", [
  example(ssrTestAppContext(browser, debug))
    .description("simple app with multiple islands sharing state")
    .script({
      suppose: [
        fact("the app is loaded in the browser", async (context) => {
          await context.server.start({
            template: "../fixtures/ssrApp/template.html",
            view: "../fixtures/ssrApp/view.ts"
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
        effect("the click counter is updated", async (context) => {
          const counterText = await context.browser.display.select("[data-click-count]").text()
          expect(counterText, is(stringContaining("3 times")))
        })
      ]
    })
])