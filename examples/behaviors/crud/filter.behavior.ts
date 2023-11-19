import { behavior, effect, example, fact, step } from "esbehavior";
import { expect, is, stringContaining } from "great-expectations";
import { testCrudApp } from "./helpers/testApp.js";
import { testRecord } from "./helpers/fakeRecord.js";


const taylor = testRecord("Taylor", "Swift")
const annakin = testRecord("Annakin", "Skywalker")
const larry = testRecord("Larry", "David")

export default behavior("filter records", [

  example(testCrudApp)
    .description("filter list of records by last name")
    .script({
      suppose: [
        fact("the app is displayed with data", async (context) => {
          await context.renderAppWithRecords([
            taylor,
            annakin,
            larry
          ])
        }),
      ],
      perform: [
        step("filter by S", async (context) => {
          await context.display.filterInput.type("s")
        })
      ],
      observe: [
        effect("only names that start with S are listed", async (context) => {
          const names = await context.display.recordsList.text()
          expect(names, is(stringContaining(taylor.asDisplayed())))
          expect(names, is(stringContaining(annakin.asDisplayed())))
          expect(names, is(stringContaining(larry.asDisplayed(), { times: 0 })))
        })
      ]
    }).andThen({
      perform: [
        step("filter by Sw", async (context) => {
          await context.display.filterInput.type("Sw")
        })
      ],
      observe: [
        effect("only names that start with Sw are listed", async (context) => {
          const names = await context.display.recordsList.text()
          expect(names, is(stringContaining(taylor.asDisplayed())))
          expect(names, is(stringContaining(annakin.asDisplayed(), { times: 0 })))
          expect(names, is(stringContaining(larry.asDisplayed(), { times: 0 })))
        })
      ]
    })

])