import { behavior, effect, example, fact, step } from "esbehavior";
import { testCrudApp } from "./helpers/testApp.js";
import { testRecord } from "./helpers/fakeRecord.js";
import { expect, is, resolvesTo, stringContaining } from "great-expectations";

const marge = testRecord("Marge", "Simpson")
const jackie = testRecord("Jackie", "Kennedy")
const beyonce = testRecord("Beyonce", "Knowles")

export default behavior("delete records", [

  example(testCrudApp)
    .description("no record is selected")
    .script({
      suppose: [
        fact("the app is displayed with some data", async (context) => {
          await context.renderAppWithRecords([
            marge,
            jackie,
            beyonce
          ])
        })
      ],
      observe: [
        effect("The delete button is disabled", async (context) => {
          await expect(context.display.deleteButton.isDisabled(), resolvesTo(true))
        })
      ]
    }),

  example(testCrudApp)
    .description("delete an existing record")
    .script({
      suppose: [
        fact("the app is loaded with data", async (context) => {
          await context.renderAppWithRecords([
            marge,
            jackie,
            beyonce
          ])
        })
      ],
      perform: [
        step("a record is selected", async (context) => {
          await context.display.recordsList.select(marge.asDisplayed())
        }),
        step("the delete button is clicked", async (context) => {
          await context.display.deleteButton.click()
        })
      ],
      observe: [
        step("the record id deleted", async (context) => {
          const recordText = await context.display.recordsList.text()
          expect(recordText, is(stringContaining(marge.asDisplayed(), { times: 0 })))
          expect(recordText, is(stringContaining(jackie.asDisplayed())))
          expect(recordText, is(stringContaining(beyonce.asDisplayed())))
        })
      ]
    })

])