import { behavior, effect, example, fact, step } from "esbehavior";
import { testStoreContext } from "./helpers/testStoreContext";
import { expect, is } from "great-expectations";

export default behavior("basic formulas", [

  example(testStoreContext())
    .description("reference another cell's value")
    .script({
      suppose: [
        fact("there is a cell with some value", (context) => {
          context.defineCell("A6", "27")
        }),
        fact("there is a cell with a formula that references the value", (context) => {
          context.defineCell("B4", "=A6")
        })
      ],
      observe: [
        effect("the value of the cells are equal", (context) => {
          expect(context.getCellValue("B4"), is("27"))
        })
      ]
    }).andThen({
      perform: [
        step("update the referenced cell", (context) => {
          context.updateCell("A6", "-42.6")
        })
      ],
      observe: [
        effect("the value of the referencing cell is updated", (context) => {
          expect(context.getCellValue("B4"), is("-42.6"))
        })
      ]
    })

])