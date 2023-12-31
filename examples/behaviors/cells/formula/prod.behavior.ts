import { behavior, effect, example, fact } from "esbehavior";
import { testStoreContext } from "./helpers/testStoreContext";
import { expect, is } from "great-expectations";

export default behavior("product function", [

  example(testStoreContext())
    .description("calculate product of several numbers")
    .script({
      suppose: [
        fact("there is a cell with a product function", (context) => {
          context.defineCell("C1", "=PROD(2,2,3,4)")
        })
      ],
      observe: [
        effect("the cell contains the calculated value", (context) => {
          expect(context.getCellValue("C1"), is("48"))
        })
      ]
    }),

  example(testStoreContext())
    .description("calculate product of cells with numbers")
    .script({
      suppose: [
        fact("there are several cells with numbers", (context) => {
          context.defineCell("A9", "2")
          context.defineCell("A10", "2")
          context.defineCell("A11", "3")
          context.defineCell("B9", "1")
          context.defineCell("B10", "2")
          context.defineCell("B11", "5")
        }),
        fact("there is a function that calculates the product of a range", (context) => {
          context.defineCell("D8", "=PROD(A9:B11)")
        })
      ],
      observe: [
        effect("the cell contains the calculated value", (context) => {
          expect(context.getCellValue("D8"), is("120"))
        })
      ]
    })

])