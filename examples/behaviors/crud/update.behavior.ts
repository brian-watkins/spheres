import { behavior, effect, example, fact, step } from "best-behavior";
import { testCrudApp } from "./helpers/testApp.js";
import { testRecord } from "./helpers/fakeRecord.js";
import { expect, is, resolvesTo, stringContaining } from "great-expectations";

const hulk = testRecord("Hulk", "Hogan")
const martin = testRecord("Martin", "Lawrence")
const guy = testRecord("Guy", "Debord")
const gary = testRecord("Gary", "Shandling")

export default behavior("update records", [
  
  example(testCrudApp)
    .description("no record is selected to update")
    .script({
      suppose: [
        fact("the app starts with some data", async (context) => {
          await context.renderAppWithRecords([
            hulk,
            martin,
            guy
          ])
        })
      ],
      observe: [
        effect("the update button is disabled", async (context) => {
          await expect(context.display.updateButton.isDisabled(), resolvesTo(true))
        })
      ]
    }),

  example(testCrudApp)
    .description("update existing record")
    .script({
      suppose: [
        fact("the app starts with some data", async (context) => {
          await context.renderAppWithRecords([
            hulk,
            martin,
            guy
          ])
        })
      ],
      perform: [
        step("select a record", async (context) => {
          await context.display.recordsList.select(martin.asDisplayed())
        }),
        step("update the first name and last name", async (context) => {
          await context.display.firstNameInput.type(gary.firstName)
          await context.display.lastNameInput.type(gary.lastName)
          await context.display.updateButton.click()
        })
      ],
      observe: [
        effect("the record is updated", async (context) => {
          const recordsText = await context.display.recordsList.text()
          expect(recordsText, is(stringContaining(hulk.asDisplayed())))
          expect(recordsText, is(stringContaining(gary.asDisplayed())))
          expect(recordsText, is(stringContaining(martin.asDisplayed(), { times: 0 })))
          expect(recordsText, is(stringContaining(guy.asDisplayed())))
        })
      ]
    }).andThen({
      perform: [
        step("select the updated row", async (context) => {
          await context.display.recordsList.select(gary.asDisplayed())
        }),
        step("update the row back to martin", async (context) => {
          await context.display.firstNameInput.type(martin.firstName)
          await context.display.lastNameInput.type(martin.lastName)
          await context.display.updateButton.click()
        })
      ],
      observe: [
        effect("the record is updated again", async (context) => {
          const recordsText = await context.display.recordsList.text()
          expect(recordsText, is(stringContaining(hulk.asDisplayed())))
          expect(recordsText, is(stringContaining(gary.asDisplayed(), { times: 0 })))
          expect(recordsText, is(stringContaining(martin.asDisplayed())))
          expect(recordsText, is(stringContaining(guy.asDisplayed())))
        })
      ]
    })

])