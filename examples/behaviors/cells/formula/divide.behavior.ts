import { behavior, effect, example, fact } from "best-behavior";
import { testStoreContext } from "./helpers/testStoreContext";
import { expect, is } from "great-expectations";
import { Result } from "../../../src/cells/result";
import { CellError, UnableToCalculate } from "../../../src/cells/formula";

export default behavior("divide function", [

  example(testStoreContext())
    .description("dividing two numbers")
    .script({
      suppose: [
        fact("there is a cell with a division formula", (context) => {
          context.defineCell("B7", "=DIV(25,5)")
        })
      ],
      observe: [
        effect("the cell contains the calculated value", (context) => {
          expect(context.getCellValue("B7"), is("5"))
        })
      ]
    }),

  example(testStoreContext())
    .description("dividing two cells with numbers")
    .script({
      suppose: [
        fact("there are some cells with numbers", (context) => {
          context.defineCell("B18", "18")
          context.defineCell("C11", "-6")
        }),
        fact("there is a cell that divides the other cell values", (context) => {
          context.defineCell("D14", "=DIV(B18,C11)")
        })
      ],
      observe: [
        effect("the cell contains the calculated value", (context) => {
          expect(context.getCellValue("D14"), is("-3"))
        })
      ]
    }),

  example(testStoreContext())
    .description("DIV formula that references non-numeric values")
    .script({
      suppose: [
        fact("there are some cells, some with text, some with numbers", (context) => {
          context.defineCell("B1", "18")
          context.defineCell("B2", "18xxx")
        }),
        fact("there is a cell with a formula that attempts to divide the cells", (context) => {
          context.defineCell("C1", "=DIV(B1,B2)")
        })
      ],
      observe: [
        effect("the cell with the formula is an error that shows it was uncalculable", (context) => {
          expect(context.getCellResult("C1"), is<Result<string, CellError>>(Result.err(new UnableToCalculate())))
        })
      ]
    })

])