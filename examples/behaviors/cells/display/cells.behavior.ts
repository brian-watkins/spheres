import { behavior, effect, example, fact, step } from "best-behavior";
import { expect, resolvesTo, stringContaining } from "great-expectations";
import { testCellsApp } from "./helpers/testApp.js";

export default behavior("cells", [

  example(testCellsApp)
    .description("cell formula that cannot be parsed")
    .script({
      suppose: [
        fact("the app is rendered", async (context) => {
          await context.renderApp()
        })
      ],
      perform: [
        step("set a bad formula in a cell", async (context) => {
          await context.display.cell("D2").setDefinition("=2D")
        })
      ],
      observe: [
        effect("the cell contains the bad formula", async (context) => {
          await expect(context.display.cell("D2").text(), resolvesTo("=2D"))
        }),
        effect("the cell is marked as invalid", async (context) => {
          await expect(context.display.cell("D2").classNames(), resolvesTo(stringContaining("bg-fuchsia-300")))
        })
      ]
    }),

  example(testCellsApp)
    .description("cell formula that cannot be calculated")
    .script({
      suppose: [
        fact("the app is rendered", async (context) => {
          await context.renderApp()
        })
      ],
      perform: [
        step("set some non-numeric values in some cells", async (context) => {
          await context.display.cell("B4").setDefinition("27")
          await context.display.cell("B5").setDefinition("27aaa")
          await context.display.cell("B6").setDefinition("27")
        }),
        step("set a formula to sum the cells", async (context) => {
          await context.display.cell("D2").setDefinition("=SUM(B4:B6)")
        })
      ],
      observe: [
        effect("the cell contains an error message", async (context) => {
          await expect(context.display.cell("D2").text(), resolvesTo("NaN"))
        }),
        effect("the cell is marked as invalid", async (context) => {
          await expect(context.display.cell("D2").classNames(), resolvesTo(stringContaining("bg-fuchsia-300")))
        })
      ]
    }),

  example(testCellsApp)
    .description("cells that reference each other")
    .script({
      suppose: [
        fact("the app is rendered", async (context) => {
          await context.renderApp()
        })
      ],
      perform: [
        step("set a number in a cell", async (context) => {
          await context.display.cell("D2").setDefinition("27")
        })
      ],
      observe: [
        effect("the cell contains the value", async (context) => {
          await expect(context.display.cell("D2").text(), resolvesTo("27"))
        })
      ]
    }).andThen({
      perform: [
        step("set a function in another cell that references the first value", async (context) => {
          await context.display.cell("E7").setDefinition("=D2")
        })
      ],
      observe: [
        effect("the cell contains the value of the first cell", async (context) => {
          await expect(context.display.cell("E7").text(), resolvesTo("27"))
        })
      ]
    }).andThen({
      perform: [
        step("the referenced cell is updated", async (context) => {
          await context.display.cell("D2").setDefinition("41")
        })
      ],
      observe: [
        effect("the referencing cell is updated to match", async (context) => {
          await expect(context.display.cell("E7").text(), resolvesTo("41"))
        })
      ]
    })

])