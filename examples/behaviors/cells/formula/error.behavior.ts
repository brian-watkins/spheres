import { behavior, effect, example, fact, step } from "esbehavior";
import { testStoreContext } from "./helpers/testStoreContext";
import { expect, is } from "great-expectations";
import { Result } from "../../../src/cells/result";

export default behavior("propogated errors", [

  example(testStoreContext())
    .description("cell with no value that references cell that cannot be parsed")
    .script({
      suppose: [
        fact("there is a cell that cannot be parsed", (context) => {
          context.defineCell("A4", "=49B")
        }),
        fact("there is a cell that references the bad cell", (context) => {
          context.defineCell("B3", "=A4")
        })
      ],
      observe: [
        effect("the referenced cell is in an error state and shows its definition", (context) => {
          expect(context.getCellResult("B3"), is(Result.err("=A4")))
        })
      ]
    }),

  example(testStoreContext())
    .description("cell that references cell that is updated to unparseable")
    .script({
      suppose: [
        fact("there is a cell that cannot be parsed", (context) => {
          context.defineCell("A4", "27")
        }),
        fact("there is a cell that references the bad cell", (context) => {
          context.defineCell("B3", "=A4")
        })
      ],
      perform: [
        step("the referenced cell is updated to an unparseable value", (context) => {
          context.updateCell("A4", "=49B")
        })
      ],
      observe: [
        effect("the referenced cell is in an error state and shows its definition", (context) => {
          expect(context.getCellResult("B3"), is(Result.err("=A4")))
        })
      ]
    })

])