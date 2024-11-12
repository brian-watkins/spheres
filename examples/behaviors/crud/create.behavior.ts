import { behavior, example, fact, step } from "best-behavior";
import { expect, is, stringContaining } from "great-expectations";
import { testCrudApp } from "./helpers/testApp.js";

export default behavior("create records", [

  example(testCrudApp)
    .description("create new record")
    .script({
      suppose: [
        fact("the app is rendered", async (context) => {
          await context.renderAppWithRecords([])
        })
      ],
      perform: [
        step("enter a name and press create", async (context) => {
          await context.display.firstNameInput.type("Brian")
          await context.display.lastNameInput.type("Watkins")
          await context.display.createButton.click()
        }),
      ],
      observe: [
        step("the record shows in the list", async (context) => {
          const records = await context.display.recordsList.text()
          expect(records, is(stringContaining("Watkins, Brian")))
        })
      ]
    })

])