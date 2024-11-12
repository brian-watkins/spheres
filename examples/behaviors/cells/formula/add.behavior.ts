import { behavior, effect, example, fact, step } from "best-behavior";
import { testStoreContext } from "./helpers/testStoreContext";
import { expect, is } from "great-expectations";
import { Result } from "../../../src/cells/result";
import { CellError, UnableToCalculate } from "../../../src/cells/formula";

export default behavior("add function", [

  example(testStoreContext())
    .description("adding two numbers")
    .script({
      suppose: [
        fact("there is a cell with a formula that adds two numbers", (context) => {
          context.defineCell("C4", "=ADD(70,53.8)")
        })
      ],
      observe: [
        effect("the cell value is the sum of the numbers", (context) => {
          expect(context.getCellValue("C4"), is("123.8"))
        })
      ]
    }),

  example(testStoreContext())
    .description("adding two cells with numbers")
    .script({
      suppose: [
        fact("there are two cells with numbers", (context) => {
          context.defineCell("A1", "-28")
          context.defineCell("A2", "33")
        }),
        fact("there is a cell with a formula that adds the two cells", (context) => {
          context.defineCell("B3", "=ADD(A1,A2)")
        })
      ],
      observe: [
        effect("the cell has the expected value", (context) => {
          expect(context.getCellValue("B3"), is("5"))
        })
      ]
    }).andThen({
      perform: [
        step("one of the cells is updated", (context) => {
          context.updateCell("A2", "31")
        })
      ],
      observe: [
        effect("the value of the referencing cell is recalculated", (context) => {
          expect(context.getCellValue("B3"), is("3"))
        })
      ]
    }),

  example(testStoreContext())
    .description("adding two cells at double-digit rows")
    .script({
      suppose: [
        fact("there are two cells with numbers at double-digit rows", (context) => {
          context.defineCell("A12", "-28")
          context.defineCell("A23", "33")
        }),
        fact("there is a cell with a formula that adds the two cells", (context) => {
          context.defineCell("B3", "=ADD(A12,A23)")
        })
      ],
      observe: [
        effect("the cell has the expected value", (context) => {
          expect(context.getCellValue("B3"), is("5"))
        })
      ]
    }),

  example(testStoreContext())
    .description("Adding cells where one is not a number")
    .script({
      suppose: [
        fact("there are two cells, one with a number, one without", (context) => {
          context.defineCell("A1", "-28")
          context.defineCell("A2", "XXX")
        }),
        fact("there is a cell with a formula that adds the two cells", (context) => {
          context.defineCell("B3", "=ADD(A1,A2)")
        })
      ],
      observe: [
        effect("the cell has an error value that shows it is not calculable", (context) => {
          expect(context.getCellResult("B3"), is<Result<string, CellError>>(Result.err(new UnableToCalculate())))
        })
      ]
    })

])