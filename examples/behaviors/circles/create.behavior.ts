import { Context, behavior, effect, example, fact, step } from "esbehavior";
import { TestCirclesApp } from "./helpers/testApp";
import { expect, resolvesTo } from "great-expectations";

export default (context: Context<TestCirclesApp>) => behavior("Create Circle", [

  example(context)
    .description("create multiple circles")
    .script({
      suppose: [
        fact("the app is rendered", async (context) => {
          await context.renderAppWithCircles([])
        })
      ],
      perform: [
        step("click the canvas area in three positions", async (context) => {
          await context.display.canvas.click({ x: 80, y: 70 })
          await context.display.canvas.click({ x: 200, y: 90 })
          await context.display.canvas.click({ x: 130, y: 270 })
        })
      ],
      observe: [
        effect("three circles are centered at the click positions", async (context) => {
          await expect(context.display.circleCenteredAt(80, 70).exists(), resolvesTo(true))
          await expect(context.display.circleCenteredAt(200, 90).exists(), resolvesTo(true))
          await expect(context.display.circleCenteredAt(130, 270).exists(), resolvesTo(true))
        })
      ]
    })

])