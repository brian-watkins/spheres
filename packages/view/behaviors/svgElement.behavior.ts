import { behavior, effect, example, fact, step } from "esbehavior"
import { browserAppContext } from "./helpers/testAppController"
import { expect, resolvesTo } from "great-expectations"

export default behavior("SVG", [

  example(browserAppContext())
    .description("svg element is rendered")
    .script({
      suppose: [
        fact("an app with SVG is loaded", async (context) => {
          await context.loadApp("svg.app")
        })
      ],
      observe: [
        effect("it renders the elements", async (context) => {
          await expect(context.display.select("text[text-anchor='middle']").text(), resolvesTo("SVG"))
        })
      ]
    }).andThen({
      perform: [
        step("update the text", async (context) => {
          await context.display.select("input").type("SO COOL")
        })
      ],
      observe: [
        effect("the svg text is updated", async (context) => {
          await expect(context.display.select("text[text-anchor='middle']").text(), resolvesTo("SO COOL"))
        })
      ]
    })

])