import { behavior, effect, example, fact, step } from "esbehavior";
import { expect, resolvesTo } from "great-expectations";
import { testCirclesApp } from "./helpers/testApp.js";
import { testCircle } from "./helpers/fakeCircle.js";

export default behavior("undo", [

  example(testCirclesApp)
    .description("no actions have been taken")
    .script({
      suppose: [
        fact("the app is rendered", async (context) => {
          await context.renderAppWithCircles([])
        })
      ],
      observe: [
        effect("the undo button is disabled", async (context) => {
          await expect(context.display.undoButton.isDisabled(), resolvesTo(true))
        })
      ]
    }),

  example(testCirclesApp)
    .description("undo circle creation")
    .script({
      suppose: [
        fact("the app is rendered", async (context) => {
          await context.renderAppWithCircles([])
        })
      ],
      perform: [
        step("create a circle", async (context) => {
          await context.display.createCircleAt(120, 200)
        }),
        step("create another circle", async (context) => {
          await context.display.createCircleAt(230, 280)
        }),
        step("the undo button is clicked", async (context) => {
          await context.display.undoButton.click()
        })
      ],
      observe: [
        effect("there is only the first circle", async (context) => {
          await expect(context.display.selectElements("circle").count(), resolvesTo(1))
          await expect(context.display.circleCenteredAt(120, 200).exists(), resolvesTo(true))
        })
      ]
    }).andThen({
      perform: [
        step("add three more circles", async (context) => {
          await context.display.createCircleAt(175, 100)
          await context.display.createCircleAt(220, 240)
          await context.display.createCircleAt(420, 380)
        })
      ],
      observe: [
        effect("there are four circles", async (context) => {
          await expect(context.display.selectElements("circle").count(), resolvesTo(4))
          await expect(context.display.circleCenteredAt(120, 200).exists(), resolvesTo(true))
          await expect(context.display.circleCenteredAt(175, 100).exists(), resolvesTo(true))
          await expect(context.display.circleCenteredAt(220, 240).exists(), resolvesTo(true))
          await expect(context.display.circleCenteredAt(420, 380).exists(), resolvesTo(true))
        })
      ]
    }).andThen({
      perform: [
        step("undo the last circle creation", async (context) => {
          await context.display.undoButton.click()
        })
      ],
      observe: [
        effect("the last circle is removed and the others remain", async (context) => {
          await expect(context.display.selectElements("circle").count(), resolvesTo(3))
          await expect(context.display.circleCenteredAt(120, 200).exists(), resolvesTo(true))
          await expect(context.display.circleCenteredAt(175, 100).exists(), resolvesTo(true))
          await expect(context.display.circleCenteredAt(220, 240).exists(), resolvesTo(true))
        })
      ]
    }),

  example(testCirclesApp)
    .description("undo circle diameter adjustment")
    .script({
      suppose: [
        fact("the app is rendered", async (context) => {
          await context.renderAppWithCircles([])
        })
      ],
      perform: [
        step("add two circles", async (context) => {
          await context.display.createCircleAt(220, 180)
          await context.display.createCircleAt(420, 280)
        }),
        step("adjust the diameter of a circle", async (context) => {
          await context.display.openDialogForCircleCenteredAt(420, 280)
          await context.display.openRadiusInputForCircleCenteredAt(420, 280)
          await context.display.radiusInput.setValue("40")
        }),
        step("close the dialog", async (context) => {
          await context.display.closeDialog()
        }),
        step("adjust the diameter of the circle several times", async (context) => {
          await context.display.openDialogForCircleCenteredAt(420, 280)
          await context.display.openRadiusInputForCircleCenteredAt(420, 280)
          await context.display.radiusInput.setValue("10")
          await context.display.radiusInput.setValue("12")
          await context.display.radiusInput.setValue("15")
        }),
        step("close the dialog", async (context) => {
          await context.display.closeDialog()
        }),
        step("click to undo", async (context) => {
          await context.display.undoButton.click()
        })
      ],
      observe: [
        effect("the diameter of the circle is the first adjusted value", async (context) => {
          await expect(context.display.circleCenteredAt(420, 280).radius, resolvesTo(40))
        })
      ]
    }).andThen({
      perform: [
        step("adjust radius to 10", async (context) => {
          await context.display.circleCenteredAt(420, 280).adjustRadiusTo(10)
        }),
        step("adjust radius to 25", async (context) => {
          await context.display.circleCenteredAt(420, 280).adjustRadiusTo(25)
        }),
        step("adjust radius to 30", async (context) => {
          await context.display.circleCenteredAt(420, 280).adjustRadiusTo(30)
        }),
        step("undo the last adjustment", async (context) => {
          await context.display.undoButton.click()
        })
      ],
      observe: [
        effect("the radius is 25", async (context) => {
          await expect(context.display.circleCenteredAt(420, 280).radius, resolvesTo(25))
        })
      ]
    }),

  example(testCirclesApp)
    .description("undo both radius and circle creation")
    .script({
      suppose: [
        fact("the app is rendered", async (context) => {
          await context.renderAppWithCircles([])
        })
      ],
      perform: [
        step("create a circle", async (context) => {
          await context.display.createCircleAt(120, 280)
        }),
        step("adjust the radius", async (context) => {
          await context.display.circleCenteredAt(120, 280).adjustRadiusTo(32)
        }),
        step("add a new circle", async (context) => {
          await context.display.createCircleAt(430, 110)
        }),
        step("adjust the new circle radius", async (context) => {
          await context.display.circleCenteredAt(430, 110).adjustRadiusTo(10)
        }),
        step("click undo", async (context) => {
          await context.display.undoButton.click()
        })
      ],
      observe: [
        effect("the last radius change is undone", async (context) => {
          await expect(context.display.circleCenteredAt(430, 110).radius, resolvesTo(20))
        }),
        effect("the first circle remains unchanged", async (context) => {
          await expect(context.display.circleCenteredAt(120, 280).radius, resolvesTo(32))
        })
      ]
    }),

  example(testCirclesApp)
    .description("closing diameter dialog without changing diameter")
    .script({
      suppose: [
        fact("the app is running", async (context) => {
          await context.renderAppWithCircles([
            testCircle(120, 110)
          ])
        })
      ],
      perform: [
        step("open the dialog", async (context) => {
          await context.display.openDialogForCircleCenteredAt(120, 110)
        }),
        step("close the dialog", async (context) => {
          await context.display.closeDialog()
        }),
        step("open the radius indicator", async (context) => {
          await context.display.openDialogForCircleCenteredAt(120, 110)
          await context.display.openRadiusInputForCircleCenteredAt(120, 110)
        }),
        step("close the dialog", async (context) => {
          await context.display.closeDialog()
        }),
        step("press undo", async (context) => {
          await context.display.undoButton.click()
        })
      ],
      observe: [
        effect("the circle is removed, since that was the last significant event", async (context) => {
          await expect(context.display.circleCenteredAt(120, 110).exists(), resolvesTo(false))
        })
      ]
    })

])
