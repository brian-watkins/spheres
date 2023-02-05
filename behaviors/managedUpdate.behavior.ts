import { behavior, effect, example, fact, step } from "esbehavior";
import { arrayWith, equalTo, expect, is, objectWith } from "great-expectations";
import { Container } from "../src/state";
import { manageContainer, Managed, managedWriter } from "../src/asyncStateManager";
import { TestStateManager } from "./helpers/testLoop";
import { testSubscriberContext } from "./helpers/testSubscriberContext";

interface ManagedContainerContext {
  view: Container<Managed<string, void>>
  manager: TestStateManager<string>
}

export default behavior("Managed Update", [
  example(testSubscriberContext<ManagedContainerContext>())
    .description("update to simple container")
    .script({
      suppose: [
        fact("there is a managed container", (context) => {
          context.setState((loop) => ({
            view: manageContainer(loop),
            manager: new TestStateManager()
          }))
          context.manageState(context.state.view, context.state.manager)
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.state.view, "subscriber-one")
        })
      ],
      observe: [
        effect("the subscriber gets the initial value", (context) => {
          expect(context.valuesReceivedBy("subscriber-one"), is(equalTo([
            { type: "loading" }
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the container value is updated", (context) => {
          context.update((loop) => {
            loop.dispatch(managedWriter(context.state.view)("Something Funny!"))
          })
        })
      ],
      observe: [
        effect("the manager gets the data to update", (context) => {
          expect(context.state.manager.lastValueToWrite!, is(equalTo("Something Funny!")))
        }),
        effect("the subscriber get a writing message", (context) => {
          expect(context.valuesReceivedBy("subscriber-one"), is(equalTo([
            { type: "loading" },
            { type: "writing", value: "Something Funny!" }
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the manager writes the value and publishes it", (context) => {
          context.state.manager.loadState("Something Funny!")
        })
      ],
      observe: [
        effect("the subscriber receives the written value", (context) => {
          expect(context.valuesReceivedBy("subscriber-one"), is(arrayWith([
            equalTo({ type: "loading" }),
            objectWith({
              type: equalTo("writing"),
              value: equalTo("Something Funny!")
            }),
            objectWith({
              type: equalTo("loaded"),
              value: equalTo("Something Funny!")
            })
          ])))
        })
      ]
    })
])