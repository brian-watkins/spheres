import { behavior, effect, example, fact, step } from "best-behavior";
import { testCirclesApp } from "./helpers/testApp.js";
import { expect, resolvesTo } from "great-expectations";
import { testCircle } from "./helpers/fakeCircle.js";

export default behavior("redo", [

  example(testCirclesApp)
    .description("before any undo")
    .script({
      suppose: [
        fact("the app is rendered", async (context) => {
          await context.renderAppWithCircles([])
        })
      ],
      observe: [
        effect("the redo button is disabled", async (context) => {
          await expect(context.display.redoButton.isDisabled(), resolvesTo(true))
        })
      ]
    }),

  example(testCirclesApp)
    .description("redo create circle")
    .script({
      suppose: [
        fact("the app is rendered", async (context) => {
          await context.renderAppWithCircles([])
        })
      ],
      perform: [
        step("create some circles", async (context) => {
          await context.display.createCircleAt(108, 290)
          await context.display.createCircleAt(210, 180)
          await context.display.createCircleAt(400, 250)
        }),
        step("undo two of the circles", async (context) => {
          await context.display.undoButton.click()
          await context.display.undoButton.click()
        })
      ],
      observe: [
        effect("there is only the first circle", async (context) => {
          await expect(context.display.selectElements("circle").count(), resolvesTo(1))
          await expect(context.display.circleCenteredAt(108, 290).exists(), resolvesTo(true))
        }),
        effect("the redo button is enabled", async (context) => {
          await expect(context.display.redoButton.isDisabled(), resolvesTo(false))
        })
      ]
    }).andThen({
      perform: [
        step("redo the creation of the two circles", async (context) => {
          await context.display.redoButton.click()
          await context.display.redoButton.click()
        })
      ],
      observe: [
        effect("all three circles exist", async (context) => {
          await expect(context.display.selectElements("circle").count(), resolvesTo(3))
          await expect(context.display.circleCenteredAt(108, 290).exists(), resolvesTo(true))
          await expect(context.display.circleCenteredAt(210, 180).exists(), resolvesTo(true))
          await expect(context.display.circleCenteredAt(400, 250).exists(), resolvesTo(true))
        }),
        effect("the redo button is disabled", async (context) => {
          await expect(context.display.redoButton.isDisabled(), resolvesTo(true))
        })
      ]
    }),

  example(testCirclesApp)
    .description("redo radius adjustment")
    .script({
      suppose: [
        fact("the app is rendered with a circle", async (context) => {
          await context.renderAppWithCircles([
            testCircle(280, 190)
          ])
        })
      ],
      perform: [
        step("adjust the radius to 25", async (context) => {
          await context.display.circleCenteredAt(280, 190).adjustRadiusTo(25)
        }),
        step("adjust the radius to 45", async (context) => {
          await context.display.circleCenteredAt(280, 190).adjustRadiusTo(45)
        }),
      ]
    }).andThen({
      observe: [
        effect("the circle has radius 45", async (context) => {
          await expect(context.display.circleCenteredAt(280, 190).radius, resolvesTo(45))
        })
      ]
    }).andThen({
      perform: [
        step("undo twice", async (context) => {
          await context.display.undoButton.click()
          await context.display.undoButton.click()
        }),
        step("redo twice", async (context) => {
          await context.display.redoButton.click()
          await context.display.redoButton.click()
        })
      ],
      observe: [
        effect("the circle has radius 45", async (context) => {
          await expect(context.display.circleCenteredAt(280, 190).radius, resolvesTo(45))
        })
      ]
    })

])