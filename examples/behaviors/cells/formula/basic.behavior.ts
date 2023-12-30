import { behavior, effect, example, fact, step } from "esbehavior";
import { testStoreContext } from "./helpers/testStoreContext";
import { expect, is } from "great-expectations";

export default behavior("basic formulas", [

  example(testStoreContext())
    .description("write arbitrary text to a cell")
    .script({
      suppose: [
        fact("there is a cell with some text", (context) => {
          context.defineCell("A2", "This == some cool text!?!?")
        })
      ],
      observe: [
        effect("the cell contains the text", (context) => {
          expect(context.getCellValue("A2"), is("This == some cool text!?!?"))
        })
      ]
    }),

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
    }),

  example(testStoreContext())
    .description("reference another cell's value at a double-digit row")
    .script({
      suppose: [
        fact("there is a cell with some value at a double-digit row", (context) => {
          context.defineCell("A61", "27")
        }),
        fact("there is a cell with a formula that references the value", (context) => {
          context.defineCell("B4", "=A61")
        })
      ],
      observe: [
        effect("the value of the cells are equal", (context) => {
          expect(context.getCellValue("B4"), is("27"))
        })
      ]
    }),

  example(testStoreContext())
    .description("binary function with another function as an argument")
    .script({
      suppose: [
        fact("there are cells with numbers", (context) => {
          context.defineCell("A21", "14")
          context.defineCell("A22", "21")
          context.defineCell("A23", "2")
        }),
        fact("there is a cell with a function that references another function", (context) => {
          context.defineCell("C9", "=SUB(SUM(A21:A23),19)")
        })
      ],
      observe: [
        effect("the cell contains the calculated value", (context) => {
          expect(context.getCellValue("C9"), is("18"))
        })
      ]
    })

])