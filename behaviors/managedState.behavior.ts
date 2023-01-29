import { behavior, effect, example, fact, step } from "esbehavior";
import { arrayWithItemAt, equalTo, expect, is, objectWith, objectWithProperty } from "great-expectations";
import { State, view } from "../src/state";
import { Managed, managedValue } from "../src/stateManager";
import { TestManager } from "./helpers/testLoop";
import { testSubscriberContext } from "./helpers/testSubscriberContext";

interface ManagedValueContext {
  view: State<Managed<string>>
  manager: TestManager<string>
}

export default behavior("managed state", [
  example(testSubscriberContext<ManagedValueContext>())
    .description("view with simple managed value")
    .script({
      suppose: [
        fact("there is a view with a managed value", (context) => {
          context.setState((loop) => ({
            view: view(loop, managedValue()),
            manager: new TestManager()
          }))
          context.manageState(context.state.view, context.state.manager)
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.state.view, "subscriber-one")
        })
      ],
      observe: [
        effect("the subscriber receives a loading message", (context) => {
          expect(context.valuesReceivedBy("subscriber-one"),
            is(arrayWithItemAt(0, objectWithProperty("type", equalTo("loading")))))
        })
      ]
    }).andThen({
      perform: [
        step("the managed value loads", (context) => {
          context.state.manager.loadState("funny")
        })
      ],
      observe: [
        effect("the subscriber receives the managed value", (context) => {
          expect(context.valuesReceivedBy("subscriber-one"),
            is(arrayWithItemAt(1, objectWith({
              type: equalTo("loaded"),
              value: equalTo("funny")
            }))))
        })
      ]
    })
])