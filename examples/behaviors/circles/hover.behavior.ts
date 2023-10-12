import { Context, behavior, effect, example, fact, step } from "esbehavior";
import { expect, resolvesTo } from "great-expectations";
import { TestCirclesApp } from "./helpers/testApp.js";

export default (context: Context<TestCirclesApp>) => behavior("hover over circle", [

  example(context)
    .description("hover over existing circle")
    .script({
      suppose: [
        fact("the app is running with some existing circles", async (context) => {
          await context.renderAppWithCircles([])
        })
      ],
      perform: [
        step("create two circles", async (context) => {
          await context.display.canvas.click({ x: 50, y: 50 })
          await context.display.canvas.click({ x: 300, y: 200 })          
        }),
        step("move the mouse out of the last circle", async (context) => {
          await context.display.canvas.moveMouse({
            from: { x: 300, y: 200 },
            to: { x: 350, y: 250 }
          })
        })
      ],
      observe: [
        effect("the circles are not filled", async (context) => {
          await expect(context.display.circleCenteredAt(50, 50).attribute("fill"), resolvesTo("transparent"))
          await expect(context.display.circleCenteredAt(300, 200).attribute("fill"), resolvesTo("transparent"))
        })
      ]
    }).andThen({
      perform: [
        step("hover over a circle", async (context) => {
          await context.display.canvas.moveMouse({
            from: { x: 10, y: 10 },
            to: { x: 48, y: 57 }
          })
        })
      ],
      observe: [
        effect("the hovered circle is filled", async (context) => {
          await expect(context.display.circleCenteredAt(50, 50).attribute("fill"), resolvesTo("#333333"))
        }),
        effect("the other circle is not filled", async (context) => {
          await expect(context.display.circleCenteredAt(300, 200).attribute("fill"), resolvesTo("transparent"))
        })
      ]
    }).andThen({
      perform: [
        step("hover over the other circle", async (context) => {
          await context.display.canvas.moveMouse({
            from: { x: 300, y: 10 },
            to: { x: 303, y: 198 }
          })
        })
      ],
      observe: [
        effect("the previously hovered circle is not filled", async (context) => {
          await expect(context.display.circleCenteredAt(50, 50).attribute("fill"), resolvesTo("transparent"))
        }),
        effect("the newly hovered circle is filled", async (context) => {
          await expect(context.display.circleCenteredAt(300, 200).attribute("fill"), resolvesTo("#333333"))
        })
      ]
    })

])