import { behavior, effect, example, fact, step } from "best-behavior";
import { expect, resolvesTo } from "great-expectations";
import { testCirclesApp } from "./helpers/testApp.js";
import { testCircle } from "./helpers/fakeCircle.js";

export default behavior("Adjust Radius", [

  example(testCirclesApp)
    .description("opening and closing the dialog")
    .script({
      suppose: [
        fact("the app is rendered", async (context) => {
          await context.renderAppWithCircles([
            testCircle(50, 50),
            testCircle(120, 120)
          ])
        })
      ],
      perform: [
        step("the dialog is opened", async (context) => {
          await context.display.openDialogForCircleCenteredAt(50, 50)
        })
      ],
      observe: [
        effect("the dialog is visible", async (context) => {
          await expect(context.display.selectElement("dialog").isVisible(), resolvesTo(true))
        }),
        effect("the circle to be adjusted is highlighted", async (context) => {
          await expect(context.display.circleCenteredAt(50, 50).isHighlighted, resolvesTo(true))
        }),
        effect("the other circle is not highlighted", async (context) => {
          await expect(context.display.circleCenteredAt(120, 120).isHighlighted, resolvesTo(false))
        })
      ]
    }).andThen({
      perform: [
        step("click outside the dialog", async (context) => {
          await context.display.selectElement("body").click({ x: 2, y: 2 })
        }),
        step("wait until the selected circle is no longer highlighted", async (context) => {
          await context.display.circleCenteredAt(50, 50).waitUntilTransparent()
        })
      ],
      observe: [
        effect("the dialog is closed", async (context) => {
          await expect(context.display.selectElement("dialog").isVisible(), resolvesTo(false))
        }),
        effect("the circle to be adjusted is no longer highlighted", async (context) => {
          await expect(context.display.circleCenteredAt(50, 50).isHighlighted, resolvesTo(false))
        })
      ]
    }),

  example(testCirclesApp)
    .description("adjust radius of existing circle")
    .script({
      suppose: [
        fact("there are some circles", async (context) => {
          await context.renderAppWithCircles([
            testCircle(100, 120),
            testCircle(320, 200)
          ])
        })
      ],
      observe: [
        effect("the radius for both circles is 20 by default", async (context) => {
          await expect(context.display.circleCenteredAt(100, 120).radius, resolvesTo(20))
          await expect(context.display.circleCenteredAt(320, 200).radius, resolvesTo(20))
        })
      ]
    }).andThen({
      perform: [
        step("open the dialog for the circle", async (context) => {
          await context.display.openDialogForCircleCenteredAt(320, 200)
        }),
        step("open the diameter input", async (context) => {
          await context.display.openRadiusInputForCircleCenteredAt(320, 200)
        }),
        step("Adjust diameter to 90 for one circle", async (context) => {
          await context.display.radiusInput.setValue("45")
        })
      ],
      observe: [
        effect("the radius for the adjusted circle is 45", async (context) => {
          await expect(context.display.circleCenteredAt(320, 200).radius, resolvesTo(45))
        }),
        effect("the radius for the other circle is unaffected", async (context) => {
          await expect(context.display.circleCenteredAt(100, 120).radius, resolvesTo(20))
        })
      ]
    }).andThen({
      perform: [
        step("close the dialog", async (context) => {
          await context.display.closeDialog()
        }),
        step("click to open the dialog for the other circle", async (context) => {
          await context.display.openDialogForCircleCenteredAt(100, 120)
        }),
        step("Reveal diameter input", async (context) => {
          await context.display.openRadiusInputForCircleCenteredAt(100, 120)
        }),
        step("Adjust diameter to 90 for one circle", async (context) => {
          await context.display.radiusInput.setValue("8")
        })
      ],
      observe: [
        effect("the radius for the adjusted circle is 16", async (context) => {
          await expect(context.display.circleCenteredAt(100, 120).radius, resolvesTo(8))
        }),
        effect("the radius for the other circle is still 45", async (context) => {
          await expect(context.display.circleCenteredAt(320, 200).radius, resolvesTo(45))
        })
      ]
    })

])