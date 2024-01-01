import { behavior, effect, example, fact } from "esbehavior";
import { testStoreContext } from "./helpers/testStoreContext";
import { expect, is } from "great-expectations";

export default behavior("multiply function", [

  example(testStoreContext())
    .description("multiplying two numbers")
    .script({
      suppose: [
        fact("there is a cell with a multiply formula", (context) => {
          context.defineCell("B7", "=MUL(8,34)")
        })
      ],
      observe: [
        effect("the cell contains the calculated value", (context) => {
          expect(context.getCellValue("B7"), is("272"))
        })
      ]
    }),

  example(testStoreContext())
    .description("multiplying two cells with numbers")
    .script({
      suppose: [
        fact("there are some cells with numbers", (context) => {
          context.defineCell("B18", "4")
          context.defineCell("C11", "-21")
        }),
        fact("there is a cell that divides the other cell values", (context) => {
          context.defineCell("D14", "=MUL(B18,C11)")
        })
      ],
      observe: [
        effect("the cell contains the calculated value", (context) => {
          expect(context.getCellValue("D14"), is("-84"))
        })
      ]
    })

])