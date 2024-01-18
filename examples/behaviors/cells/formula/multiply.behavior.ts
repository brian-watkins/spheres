import { behavior, effect, example, fact } from "esbehavior";
import { testStoreContext } from "./helpers/testStoreContext";
import { expect, is } from "great-expectations";
import { Result } from "../../../src/cells/result";
import { CellError, UnableToCalculate } from "../../../src/cells/formula";

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
        fact("there is a cell that multiplies the other cell values", (context) => {
          context.defineCell("D14", "=MUL(B18,C11)")
        })
      ],
      observe: [
        effect("the cell contains the calculated value", (context) => {
          expect(context.getCellValue("D14"), is("-84"))
        })
      ]
    }),

  example(testStoreContext())
    .description("MUL formula that references non-numeric values")
    .script({
      suppose: [
        fact("there are some cells, some with text, some with numbers", (context) => {
          context.defineCell("B1", "18")
          context.defineCell("B2", "18xxx")
        }),
        fact("there is a cell with a formula that attempts to multiple the cells", (context) => {
          context.defineCell("C1", "=MUL(B1,B2)")
        })
      ],
      observe: [
        effect("the cell with the formula is an error that shows it was uncalculable", (context) => {
          expect(context.getCellResult("C1"), is<Result<string, CellError>>(Result.err(new UnableToCalculate())))
        })
      ]
    })

])