import { behavior, effect, example, fact, step } from "esbehavior";
import { expect, resolvesTo } from "great-expectations";
import { testCellsApp } from "./helpers/testApp.js";

export default behavior("cells", [

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