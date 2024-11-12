import { behavior, effect, example, fact } from "best-behavior";
import { testStoreContext } from "./helpers/testStoreContext";
import { expect, is } from "great-expectations";
import { Result } from "../../../src/cells/result";
import { CellError, UnableToCalculate } from "../../../src/cells/formula";

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
    }),

  example(testStoreContext())
    .description("PROD formula that references non-numeric values")
    .script({
      suppose: [
        fact("there are some cells, some with text, some with numbers", (context) => {
          context.defineCell("B1", "18")
          context.defineCell("B2", "18xxx")
          context.defineCell("B3", "4")
        }),
        fact("there is a cell with a formula that attempts to multiply the cells", (context) => {
          context.defineCell("C1", "=PROD(B1:B3)")
        })
      ],
      observe: [
        effect("the cell with the formula is an error that shows it was uncalculable", (context) => {
          expect(context.getCellResult("C1"), is<Result<string, CellError>>(Result.err(new UnableToCalculate())))
        })
      ]
    })

])