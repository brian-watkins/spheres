import { behavior, effect, example, fact, step } from "esbehavior";
import { arrayWith, arrayWithItemAt, equalTo, expect, is, Matcher, objectWith, objectWithProperty } from "great-expectations";
import { container, Container, state, State, useProvider, withInitialValue } from "../src/state";
import { testSubscriberContext } from "./helpers/testSubscriberContext";
import { TestProvidedState, TestProvider } from "./helpers/testProvider";

interface ProvidedValueContext {
  receiver: State<TestProvidedState<string>>
  provider: TestProvider<string>
}

const simpleProvidedValue =
  example(testSubscriberContext<ProvidedValueContext>())
    .description("view with simple provided value")
    .script({
      suppose: [
        fact("there is a view with a provided value", (context) => {
          context.setState((loop) => {
            const receiver = state<TestProvidedState<string>>(withInitialValue({ type: "unknown" }), loop)
            const provider = new TestProvider<string>()
            provider.setHandler(async (get, set, waitFor) => {
              set(receiver, { type: "loading" })
              const value = await waitFor()
              set(receiver, { type: "loaded", value })
            })
            useProvider(provider, loop)

            return {
              receiver,
              provider
            }
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.state.receiver, "sub-one")
        })
      ],
      observe: [
        effect("the subscriber receives a loading message", (context) => {
          expect(context.valuesReceivedBy("sub-one"),
            is(arrayWith([
              objectWithProperty("type", equalTo("loading")),
            ])))
        })
      ]
    }).andThen({
      perform: [
        step("the provided value loads", (context) => {
          context.state.provider.resolver?.("funny")
        })
      ],
      observe: [
        effect("the subscriber receives the provided value", (context) => {
          expect(context.valuesReceivedBy("sub-one"),
            is(arrayWithItemAt(1, objectWith({
              type: equalTo("loaded"),
              value: equalTo("funny")
            }))))
        })
      ]
    })

interface ProvidedValueWithKeyContext {
  profileState: Container<string>,
  pageNumberState: Container<number>,
  receiver: State<TestProvidedState<string>>
  provider: TestProvider<string>
}

const providedValueWithDerivedKey =
  example(testSubscriberContext<ProvidedValueWithKeyContext>())
    .description("provided value with derived key")
    .script({
      suppose: [
        fact("there is a view with a provided value", (context) => {
          context.setState((loop) => {
            const profileState = container(withInitialValue("profile-1"), loop)
            const pageNumberState = container(withInitialValue(17), loop)
            const receiver = container<TestProvidedState<string>>(withInitialValue({ type: "unknown" }), loop)
            const provider = new TestProvider<string>()
            provider.setHandler(async (get, set, waitFor) => {
              const key = {
                profileId: get(profileState),
                page: get(pageNumberState)
              }
              set(receiver, { type: "loading", key })
              const extraValue = await waitFor()
              set(receiver, { type: "loaded", value: `Value: ${extraValue} for profile ${key.profileId} on page ${key.page}` })
            })
            useProvider(provider, loop)

            return {
              profileState,
              pageNumberState,
              receiver,
              provider
            }
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.state.receiver, "sub-one")
        })
      ],
      observe: [
        effect("the current key is used", (context) => {
          expect(context.valuesReceivedBy("sub-one"), is(arrayWith([
            loadingState({ profileId: "profile-1", page: 17 })
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the provided value loads", (context) => {
          context.state.provider.resolver?.("Fun Stuff")
        }),
        step("the key changes", (context) => {
          context.updateState(context.state.profileState, "profile-7")
        })
      ],
      observe: [
        effect("the provided state returns to loading", (context) => {
          expect(context.valuesReceivedBy("sub-one"),
            is(arrayWith([
              loadingState({ profileId: "profile-1", page: 17 }),
              loadedWith("Fun Stuff", { profileId: "profile-1", page: 17 }),
              loadingState({ profileId: "profile-7", page: 17 })
            ])))
        }),
      ]
    }).andThen({
      perform: [
        step("another subscriber joins", (context) => {
          context.subscribeTo(context.state.receiver, "sub-two")
        })
      ],
      observe: [
        effect("the subscriber gets the latest provided value", (context) => {
          expect(context.valuesReceivedBy("sub-two"), is(arrayWith([
            loadingState({ profileId: "profile-7", page: 17 })
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the provided value is updated", (context) => {
          context.state.provider.resolver?.("Even more fun stuff!")
        })
      ],
      observe: [
        effect("subscriber-one gets the update", (context) => {
          expect(context.valuesReceivedBy("sub-one"),
            is(arrayWith([
              loadingState({ profileId: "profile-1", page: 17 }),
              loadedWith("Fun Stuff", { profileId: "profile-1", page: 17 }),
              loadingState({ profileId: "profile-7", page: 17 }),
              loadedWith("Even more fun stuff!", { profileId: "profile-7", page: 17 }),
            ])))
        }),
        effect("subscriber-two gets the update", (context) => {
          expect(context.valuesReceivedBy("sub-two"),
            is(arrayWith([
              loadingState({ profileId: "profile-7", page: 17 }),
              loadedWith("Even more fun stuff!", { profileId: "profile-7", page: 17 })
            ])))
        })
      ]
    }).andThen({
      perform: [
        step("a third subscriber joins", (context) => {
          context.subscribeTo(context.state.receiver, "sub-three")
        }),
        step("a state dependency is updated", (context) => {
          context.updateState(context.state.pageNumberState, 21)
        })
      ],
      observe: [
        effect("subscriber-one returns to loading", (context) => {
          expect(context.valuesReceivedBy("sub-one"),
            is(arrayWith([
              loadingState({ profileId: "profile-1", page: 17 }),
              loadedWith("Fun Stuff", { profileId: "profile-1", page: 17 }),
              loadingState({ profileId: "profile-7", page: 17 }),
              loadedWith("Even more fun stuff!", { profileId: "profile-7", page: 17 }),
              loadingState({ profileId: "profile-7", page: 21 })
            ])))
        }),
        effect("subscriber-two gets the loading update", (context) => {
          expect(context.valuesReceivedBy("sub-two"),
            is(arrayWith([
              loadingState({ profileId: "profile-7", page: 17 }),
              loadedWith("Even more fun stuff!", { profileId: "profile-7", page: 17 }),
              loadingState({ profileId: "profile-7", page: 21 })
            ])))
        }),
        effect("the third subscriber gets the latest provided value and the loading update", (context) => {
          expect(context.valuesReceivedBy("sub-three"),
            is(arrayWith([
              loadedWith("Even more fun stuff!", { profileId: "profile-7", page: 17 }),
              loadingState({ profileId: "profile-7", page: 21 })
            ])))
        })
      ]
    })

function loadingState(key?: any): Matcher<TestProvidedState<string>> {
  return objectWith({
    type: equalTo("loading"),
    key: equalTo(key)
  })
}

function loadedWith(value: string, key: any): Matcher<TestProvidedState<string>> {
  return objectWith({
    type: equalTo("loaded"),
    value: equalTo(`Value: ${value} for profile ${key.profileId} on page ${key.page}`)
  })
}

export default behavior("state provider", [
  simpleProvidedValue,
  providedValueWithDerivedKey
])