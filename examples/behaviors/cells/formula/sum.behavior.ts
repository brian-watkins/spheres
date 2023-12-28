import { behavior, effect, example, fact } from "esbehavior";
import { testStoreContext } from "./helpers/testStoreContext";
import { expect, is } from "great-expectations";

export default behavior("sum function", [

  example(testStoreContext())
    .description("sum many numbers")
    .script({
      suppose: [
        fact("there is a cell with a function to sum many numbers", (context) => {
          context.defineCell("D4", "=SUM(2,4,5,12,33,-10,4.5)")
        })
      ],
      observe: [
        effect("the cell has the calculated value", (context) => {
          expect(context.getCellValue("D4"), is("50.5"))
        })
      ]
    }),

  example(testStoreContext())
    .description("sum many numbers from many cells")
    .script({
      suppose: [
        fact("there are several cells with numbers", (context) => {
          context.defineCell("A2", "27")
          context.defineCell("B2", "-12")
          context.defineCell("C2", "-0.8")
        }),
        fact("there is a cell that sums the other cell values", (context) => {
          context.defineCell("D3", "=SUM(A2,B2,C2,10)")
        })
      ],
      observe: [
        effect("the calculated value is shown", (context) => {
          expect(context.getCellValue("D3"), is("24.2"))
        })
      ]
    })

])