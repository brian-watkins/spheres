import { behavior, effect, example, fact, step } from "best-behavior";
import { testCirclesApp } from "./helpers/testApp";
import { expect, resolvesTo } from "great-expectations";

export default behavior("Create Circle", [

  example(testCirclesApp)
    .description("create a circle")
    .script({
      suppose: [
        fact("the app is rendered", async (context) => {
          await context.renderAppWithCircles([])
        })
      ],
      perform: [
        step("click the canvas area", async (context) => {
          await context.display.canvas.click({ x: 280, y: 120 })
        })
      ],
      observe: [
        effect("there is a circle and it is highlighted", async (context) => {
          await expect(context.display.circleCenteredAt(280, 120).isHighlighted, resolvesTo(true))
        })
      ]
    }),

  example(testCirclesApp)
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
          await expect(context.display.circleCenteredAt(80, 70).isVisible(), resolvesTo(true))
          await expect(context.display.circleCenteredAt(200, 90).isVisible(), resolvesTo(true))
          await expect(context.display.circleCenteredAt(130, 270).isVisible(), resolvesTo(true))
        })
      ]
    })

])