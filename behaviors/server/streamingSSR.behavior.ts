import { behavior, effect, example, fact, step } from "best-behavior";
import { ssrTestAppContext } from "./helpers/testSSRServer";
import { expect, resolvesTo, stringContaining } from "great-expectations";

export default behavior("ssr with streaming data", [

  example(ssrTestAppContext())
    .description("initial html and streaming data updates")
    .script({
      suppose: [
        fact("the app is loaded in the browser", async (context) => {
          context.server.setStreamingSSRApp({
            view: "./behaviors/server/fixtures/ssrApp/streaming/server.ts"
          })
          await context.browser.loadApp()
        })
      ],
      observe: [
        effect("the list is loaded eventually", async (context) => {
          await expect(context.browser.display.select("[data-title]").text(), resolvesTo(
            "Behold, the 6 things!"
          ))
        }),
        effect("the value is loaded eventually and updated after the response is complete", async (context) => {
          await expect(context.browser.display.select("[data-value]").text(), resolvesTo(
            stringContaining("hundreds of")
          ))
        })
      ]
    }),

  example(ssrTestAppContext())
    .description("error in streamed data")
    .script({
      suppose: [
        fact("the app is loaded in the browser", async (context) => {
          context.server.setStreamingSSRApp({
            view: "./behaviors/server/fixtures/ssrApp/streamingError/server.ts"
          })
          await context.browser.loadApp()
        })
      ],
      observe: [
        effect("the list error is shown eventually", async (context) => {
          await expect(context.browser.display.select("[data-title]").text(), resolvesTo(
            stringContaining("Oops!")
          ))
        }),
        effect("the value is loaded eventually and updated after the response is complete", async (context) => {
          await expect(context.browser.display.select("[data-value]").text(), resolvesTo(
            stringContaining("hundreds of")
          ))
        })
      ]
    }),

  example(ssrTestAppContext())
    .description("streaming but store init has no promises")
    .script({
      suppose: [
        fact("the app is loaded in the browser", async (context) => {
          context.server.setStreamingSSRApp({
            view: "./behaviors/server/fixtures/ssrApp/streamingSync/server.ts"
          })
          await context.browser.loadApp()
        })
      ],
      observe: [
        effect("the list is loaded eventually", async (context) => {
          await expect(context.browser.display.select("[data-title]").text(), resolvesTo(
            "Behold, the 6 things!"
          ))
        }),
        effect("the value is loaded eventually and updated after the response is complete", async (context) => {
          await expect(context.browser.display.select("[data-value]").text(), resolvesTo(
            stringContaining("hundreds of")
          ))
        })
      ]
    }),

  example(ssrTestAppContext())
    .description("streaming multiple zones")
    .script({
      suppose: [
        fact("the app is loaded in the browser", async (context) => {
          context.server.setStreamingSSRApp({
            view: "./behaviors/server/fixtures/ssrApp/streamingZones/server.ts"
          })
          await context.browser.loadApp()
        })
      ],
      observe: [
        effect("the data for each zone is streamed to the browser", async (context) => {
          await expect(context.browser.display.select(`[data-zone="one"] h3`).text(), resolvesTo(
            "The count is 17"
          ))
          await expect(context.browser.display.select(`[data-zone="two"] h3`).text(), resolvesTo(
            "The count is 21"
          ))
          await expect(context.browser.display.select(`[data-zone="three"] h3`).text(), resolvesTo(
            stringContaining("Oops")
          ))
        })
      ]
    }).andThen({
      perform: [
        step("click the button in the first zone", async (context) => {
          await context.browser.display.select(`[data-zone="one"] button`).click()
          await context.browser.display.select(`[data-zone="one"] button`).click()
        }),
        step("click the button the second zone", async (context) => {
          await context.browser.display.select(`[data-zone="two"] button`).click()
          await context.browser.display.select(`[data-zone="two"] button`).click()
          await context.browser.display.select(`[data-zone="two"] button`).click()
          await context.browser.display.select(`[data-zone="two"] button`).click()
        })
      ],
      observe: [
        effect("the counts update for each zone", async (context) => {
          await expect(context.browser.display.select(`[data-zone="one"] h3`).text(), resolvesTo(
            "The count is 19"
          ))
          await expect(context.browser.display.select(`[data-zone="two"] h3`).text(), resolvesTo(
            "The count is 25"
          ))
          await expect(context.browser.display.select(`[data-zone="three"] h3`).text(), resolvesTo(
            stringContaining("Oops")
          ))
        })
      ]
    })


])