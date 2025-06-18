import { behavior, effect, example, fact } from "best-behavior";
import { ssrTestAppContext } from "./helpers/testSSRServer";
import { expect, resolvesTo } from "great-expectations";

export default behavior("ssr with streaming data", [

  example(ssrTestAppContext())
    .description("initial html and streaming data updates")
    .script({
      suppose: [
        fact("the app is loaded in the browser", async (context) => {
          context.server.setStreamingSSRApp({
            template: "../fixtures/ssrApp/streaming/template.html",
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
      ]
    })

])