import { behavior, effect, example, fact, step } from "esbehavior";
import { arrayWith, defined, equalTo, expect, is, objectWith } from "great-expectations";
import { container, Container, managedBy, withInitialValue } from "../src/state";
import { Managed, managedWriter } from "../src/asyncStateManager";
import { TestStateManager } from "./helpers/testLoop";
import { testSubscriberContext } from "./helpers/testSubscriberContext";

interface ManagedContainerContext {
  view: Container<Managed<string, void>>
  manager: TestStateManager<string>
}

const simpleManagedContainer =
  example(testSubscriberContext<ManagedContainerContext>())
    .description("update to simple container")
    .script({
      suppose: [
        fact("there is a managed container", (context) => {
          const manager = new TestStateManager<string>()
          context.setState((loop) => ({
            view: container(managedBy(manager), loop),
            manager
          }))
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

interface ManagedContainerWithKeyContext {
  userIdState: Container<string>
  container: Container<Managed<number, string>>
  manager: TestStateManager<number, string>
}

const managedContainerWithDerivedKey =
  example(testSubscriberContext<ManagedContainerWithKeyContext>())
    .description("managed container with derived key")
    .script({
      suppose: [
        fact("there is a managed container with a derived key", (context) => {
          context.setState((loop) => {
            const manager = new TestStateManager<number, string>()
            const userIdState = container(withInitialValue("person-1"), loop)
            return {
              userIdState,
              container: container(managedBy(manager, {
                withDerivedKey(get) {
                  return `User Id: ${get(userIdState)}`
                },
              }), loop),
              manager
            }
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.state.container, "sub-one")
        })
      ],
      observe: [
        effect("the state manager gets the initial derived key", (context) => {
          expect(context.state.manager.lastRefreshKey, is(defined()))
          expect(context.state.manager.lastRefreshKey!, is(equalTo("User Id: person-1")))
        }),
        effect("the subscriber gets the initial state with the derived key", (context) => {
          expect(context.valuesReceivedBy("sub-one"), is(equalTo([
            { type: "loading", key: "User Id: person-1" }
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the manager produces a new value", (context) => {
          context.state.manager.loadState(27)
        })
      ],
      observe: [
        effect("the subscriber gets the loaded value", (context) => {
          expect(context.valuesReceivedBy("sub-one"), is(equalTo([
            { type: "loading", key: "User Id: person-1" },
            { type: "loaded", value: 27, key: "User Id: person-1" }
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the user id state changes", (context) => {
          context.updateState(context.state.userIdState, "person-22")
        })
      ],
      observe: [
        effect("the state manager gets the new refresh key", (context) => {
          expect(context.state.manager.lastRefreshKey!, is(equalTo("User Id: person-22")))
        }),
        effect("the subscriber gets a loading message with the new key", (context) => {
          expect(context.valuesReceivedBy("sub-one"), is(equalTo([
            { type: "loading", key: "User Id: person-1" },
            { type: "loaded", value: 27, key: "User Id: person-1" },
            { type: "loading", key: "User Id: person-22" }
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the container receives a write message", (context) => {
          context.update((loop) => {
            loop.dispatch(managedWriter(context.state.container)(44))
          })
        })
      ],
      observe: [
        effect("the state manager gets the new value to write", (context) => {
          expect(context.state.manager.lastValueToWrite, is(defined()))
          expect(context.state.manager.lastValueToWrite!, is(equalTo(44)))
        }),
        effect("the subscriber gets a writing message with the new value", (context) => {
          expect(context.valuesReceivedBy("sub-one"), is(equalTo([
            { type: "loading", key: "User Id: person-1" },
            { type: "loaded", value: 27, key: "User Id: person-1" },
            { type: "loading", key: "User Id: person-22" },
            { type: "writing", value: 44 }
          ])))
        })
      ]
    })

export default behavior("Managed Update", [
  simpleManagedContainer,
  managedContainerWithDerivedKey
])