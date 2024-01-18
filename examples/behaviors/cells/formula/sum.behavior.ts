import { behavior, effect, example, fact } from "esbehavior";
import { testStoreContext } from "./helpers/testStoreContext";
import { expect, is } from "great-expectations";
import { Result } from "../../../src/cells/result";
import { CellError, UnableToCalculate } from "../../../src/cells/formula";

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
    }),

  example(testStoreContext())
    .description("sum many numbers from a one column range of cells")
    .script({
      suppose: [
        fact("there are several cells with numbers", (context) => {
          context.defineCell("A2", "27")
          context.defineCell("A3", "-41")
          context.defineCell("A4", "22")
        }),
        fact("there is a cell that sums the other cell values", (context) => {
          context.defineCell("D3", "=SUM(10,A2:A4,-14)")
        })
      ],
      observe: [
        effect("the calculated value is shown", (context) => {
          expect(context.getCellValue("D3"), is("4"))
        })
      ]
    }),

  example(testStoreContext())
    .description("sum many numbers from a multiple column range of cells")
    .script({
      suppose: [
        fact("there are several cells with numbers", (context) => {
          context.defineCell("A2", "27")
          context.defineCell("A3", "-41")
          context.defineCell("A4", "22")
          context.defineCell("A5", "19")
          context.defineCell("B2", "13")
          context.defineCell("B3", "8")
          context.defineCell("B4", "2")
          context.defineCell("C2", "-12")
          context.defineCell("C3", "18")
          context.defineCell("C4", "9")
        }),
        fact("there is a cell that sums the other cell values", (context) => {
          context.defineCell("D8", "=SUM(a2:C4)")
        })
      ],
      observe: [
        effect("the calculated value is shown", (context) => {
          expect(context.getCellValue("D8"), is("46"))
        })
      ]
    }),

  example(testStoreContext())
    .description("sum many numbers from a multiple column range of cells with double-digit rows")
    .script({
      suppose: [
        fact("there are several cells with numbers at double-digit rows", (context) => {
          context.defineCell("A22", "27")
          context.defineCell("A23", "-41")
          context.defineCell("A24", "22")
          context.defineCell("A25", "19")
          context.defineCell("B22", "13")
          context.defineCell("B23", "8")
          context.defineCell("B24", "2")
          context.defineCell("C22", "-12")
          context.defineCell("C23", "18")
          context.defineCell("C24", "9")
        }),
        fact("there is a cell that sums the other cell values", (context) => {
          context.defineCell("D8", "=SUM(A22:C24)")
        })
      ],
      observe: [
        effect("the calculated value is shown", (context) => {
          expect(context.getCellValue("D8"), is("46"))
        })
      ]
    }),

  example(testStoreContext())
    .description("SUM formula that references non-numeric values")
    .script({
      suppose: [
        fact("there are some cells, some with text, some with numbers", (context) => {
          context.defineCell("B1", "18")
          context.defineCell("B2", "18xxx")
          context.defineCell("B3", "4")
        }),
        fact("there is a cell with a formula that attempts to sum the cells", (context) => {
          context.defineCell("C1", "=SUM(B1:B3)")
        })
      ],
      observe: [
        effect("the cell with the formula is an error that shows it was uncalculable", (context) => {
          expect(context.getCellResult("C1"), is<Result<string, CellError>>(Result.err(new UnableToCalculate())))
        })
      ]
    })

])