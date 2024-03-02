import { behavior, ConfigurableExample, Context, effect, example, fact, step } from "esbehavior";
import { equalTo, expect, is } from "great-expectations";
import { DOMChangeRecord, DOMStructureChangeRecord } from "./helpers/changeRecords.js";
import { browserAppContext, TestAppController } from "./helpers/testAppController.js";

export default
  behavior("keyed list", [
    exampleGenerator(browserAppContext(), "key on stateful zone", "keyOnZoneWithState.app"),
    exampleGenerator(browserAppContext(), "key on template", "keyOnZoneWithTemplate.app"),
    exampleGenerator(browserAppContext(), "key on zone", "keyOnZone.app")
  ])

function exampleGenerator(context: Context<TestAppController>, description: string, appName: string): ConfigurableExample {
  return example(context)
    .description(description)
    .script({
      suppose: [
        fact("there is a list of view state elements with a key", async (controller) => {
          await controller.loadApp(appName)
        }),
        fact("observe the element", async (controller) => {
          await controller.display.observe("#reorder-list")
        })
      ],
      observe: [
        effect("the people are listed", async (context) => {
          const people = await context.display.selectAll("[data-person]").map(el => el.text())
          expect(people, is(equalTo([
            "Cool Dude is 9 years old: 1",
            "Fundamentally Awesome is 21 years old: 1",
            "Happy Animal is 12 years old: 1"
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the items are updated", async (context) => {
          await context.display.select("button[data-increment-ticker]").click()
        }),
        step("the view state list is updated", async (context) => {
          await context.display.select("button[data-reorder]").click()
        }),
      ],
      observe: [
        effect("the people are listed in the updated order", async (context) => {
          const people = await context.display.selectAll("[data-person]").map(el => el.text())
          expect(people, is(equalTo([
            "Fundamentally Awesome is 21 years old: 2",
            "Happy Animal is 12 years old: 2",
            "Cool Dude is 9 years old: 2",
          ])))
        }),
        effect("only one element was reordered", async (context) => {
          const changeRecords = await context.display.changeRecords()
          const addedNodes = sumUpStructureChanges(changeRecords, (record) => record.addedNodes)
          const removedNodes = sumUpStructureChanges(changeRecords, (record) => record.removedNodes)

          expect(removedNodes, is(equalTo(1)), "Only one node should be removed")
          expect(addedNodes, is(equalTo(1)), "Only one node should be added")
        })
      ]
    })
}


function sumUpStructureChanges(records: Array<DOMChangeRecord>, property: (record: DOMStructureChangeRecord) => number): number {
  return records.reduce((acc, curr) => {
    if (curr.type === "structure") {
      return acc + property(curr)
    } else {
      return acc
    }
  }, 0)
}
