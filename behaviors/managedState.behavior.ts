import { behavior, effect, example, fact, step } from "esbehavior";
import { arrayWith, arrayWithItemAt, defined, equalTo, expect, is, objectWith, objectWithProperty } from "great-expectations";
import { Matcher } from "great-expectations/dist/matcher";
import { container, Container, State } from "../src/state";
import { manage, Managed } from "../src/asyncStateManager";
import { TestStateManager } from "./helpers/testLoop";
import { testSubscriberContext } from "./helpers/testSubscriberContext";

interface ManagedValueContext {
  view: State<Managed<string, void>>
  manager: TestStateManager<string>
}

const simpleManagedValue =
  example(testSubscriberContext<ManagedValueContext>())
    .description("view with simple managed value")
    .script({
      suppose: [
        fact("there is a view with a managed value", (context) => {
          context.setState((loop) => ({
            view: manage(loop),
            manager: new TestStateManager()
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

interface FunKey {
  profileId: string
  page: number
}

interface ManagedValueWithKeyContext {
  profileState: Container<string>,
  view: State<Managed<string, FunKey>>
  manager: TestStateManager<string, FunKey>
}

const managedValueWithDerivedKey =
  example(testSubscriberContext<ManagedValueWithKeyContext>())
    .description("managed value with derived key")
    .script({
      suppose: [
        fact("there is a view with a managed value", (context) => {
          context.setState((loop) => {
            const profileState = container(loop, "profile-1")
            const pageNumber = container(loop, 17)
            return {
              profileState,
              view: manage(loop, (get) => ({
                profileId: get(profileState),
                page: get(pageNumber)
              })),
              manager: new TestStateManager()
            }
          })
          context.manageState(context.state.view, context.state.manager)
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.state.view, "subscriber-one")
        })
      ],
      observe: [
        effect("the state manager is passed the current value of the key", (context) => {
          expect(context.state.manager.lastRefreshKey, is(defined()))
          expect(context.state.manager.lastRefreshKey!, is(equalTo({
            profileId: "profile-1",
            page: 17
          })))
        })
      ]
    }).andThen({
      perform: [
        step("the managed value loads", (context) => {
          context.state.manager.loadState("Fun Stuff")
        }),
        step("the key changes", (context) => {
          context.updateState(context.state.profileState, "profile-7")
        })
      ],
      observe: [
        effect("the managed state returns to loading", (context) => {
          expect(context.valuesReceivedBy("subscriber-one"),
            is(arrayWith([
              loadingState({ profileId: "profile-1", page: 17 }),
              loadedWith("Fun Stuff", { profileId: "profile-1", page: 17 }),
              loadingState({ profileId: "profile-7", page: 17 })
            ])))
        }),
        effect("the state manager gets the updated key", (context) => {
          expect(context.state.manager.lastRefreshKey!, is(equalTo({
            profileId: "profile-7",
            page: 17
          })))
        })
      ]
    }).andThen({
      perform: [
        step("another subscriber joins", (context) => {
          context.subscribeTo(context.state.view, "subscriber-two")
        })
      ],
      observe: [
        effect("the subscriber gets the latest managed value", (context) => {
          loadingState({ profileId: "profile-7", page: 17 })
        })
      ]
    }).andThen({
      perform: [
        step("the managed value is updated", (context) => {
          context.state.manager.loadState("Even more fun stuff!")
        })
      ],
      observe: [
        effect("subscriber-one gets the update", (context) => {
          expect(context.valuesReceivedBy("subscriber-one"),
            is(arrayWith([
              loadingState({ profileId: "profile-1", page: 17 }),
              loadedWith("Fun Stuff", { profileId: "profile-1", page: 17 }),
              loadingState({ profileId: "profile-7", page: 17 }),
              loadedWith("Even more fun stuff!", { profileId: "profile-7", page: 17 }),
            ])))
        }),
        effect("subscriber-two gets the update", (context) => {
          expect(context.valuesReceivedBy("subscriber-two"),
            is(arrayWith([
              loadingState({ profileId: "profile-7", page: 17 }),
              loadedWith("Even more fun stuff!", { profileId: "profile-7", page: 17 })
            ])))
        })
      ]
    }).andThen({
      perform: [
        step("a third subscriber join", (context) => {
          context.subscribeTo(context.state.view, "subscriber-three")
        })
      ],
      observe: [
        effect("the third subscriber gets the latest managed value", (context) => {
          expect(context.valuesReceivedBy("subscriber-three"),
            is(arrayWith([
              loadedWith("Even more fun stuff!", { profileId: "profile-7", page: 17 })
            ])))
        })
      ]
    })

function loadingState(key?: any): Matcher<Managed<string, any>> {
  return objectWith({
    type: equalTo("loading"),
    key: equalTo(key)
  })
}

function loadedWith(value: string, key?: any): Matcher<Managed<string, any>> {
  return objectWith({
    type: equalTo("loaded"),
    value: equalTo(value),
    key: equalTo(key)
  })
}

export default behavior("managed state", [
  simpleManagedValue,
  managedValueWithDerivedKey
])