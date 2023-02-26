import { behavior, effect, example, fact, step } from "esbehavior";
import { arrayWith, arrayWithItemAt, equalTo, expect, is, Matcher, objectWith, objectWithProperty } from "great-expectations";
import { Container, Provider, State } from "@src/loop.js";
import { testSubscriberContext } from "./helpers/testSubscriberContext.js";
import { TestProvidedState, TestProvider } from "./helpers/testProvider.js";
import { container, state, useProvider, withInitialValue } from "@src/index.js";

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
          const receiver = state<TestProvidedState<string>>(() => ({ type: "unknown" }))
          const provider = new TestProvider<string>()
          provider.setHandler(async (_, set, waitFor) => {
            set(receiver, { type: "loading" })
            const value = await waitFor()
            set(receiver, { type: "loaded", value })
          })
          useProvider(provider)
          context.setState({
            receiver,
            provider
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
          const profileState = container(withInitialValue("profile-1"))
          const pageNumberState = container(withInitialValue(17))
          const receiver = container<TestProvidedState<string>>(withInitialValue({ type: "unknown" }))
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
          useProvider(provider)
          context.setState({
            profileState,
            pageNumberState,
            receiver,
            provider
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
          context.write(context.state.profileState, "profile-7")
        })
      ],
      observe: [
        effect("the provided state returns to loading", (context) => {
          expect(context.valuesReceivedBy("sub-one"),
            is(arrayWith([
              loadingState({ profileId: "profile-1", page: 17 }),
              loadedWith(`Value: Fun Stuff for profile profile-1 on page 17`),
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
              loadedWith("Value: Fun Stuff for profile profile-1 on page 17"),
              loadingState({ profileId: "profile-7", page: 17 }),
              loadedWith("Value: Even more fun stuff! for profile profile-7 on page 17"),
            ])))
        }),
        effect("subscriber-two gets the update", (context) => {
          expect(context.valuesReceivedBy("sub-two"),
            is(arrayWith([
              loadingState({ profileId: "profile-7", page: 17 }),
              loadedWith("Value: Even more fun stuff! for profile profile-7 on page 17")
            ])))
        })
      ]
    }).andThen({
      perform: [
        step("a third subscriber joins", (context) => {
          context.subscribeTo(context.state.receiver, "sub-three")
        }),
        step("a state dependency is updated", (context) => {
          context.write(context.state.pageNumberState, 21)
        })
      ],
      observe: [
        effect("subscriber-one returns to loading", (context) => {
          expect(context.valuesReceivedBy("sub-one"),
            is(arrayWith([
              loadingState({ profileId: "profile-1", page: 17 }),
              loadedWith("Value: Fun Stuff for profile profile-1 on page 17"),
              loadingState({ profileId: "profile-7", page: 17 }),
              loadedWith("Value: Even more fun stuff! for profile profile-7 on page 17"),
              loadingState({ profileId: "profile-7", page: 21 })
            ])))
        }),
        effect("subscriber-two gets the loading update", (context) => {
          expect(context.valuesReceivedBy("sub-two"),
            is(arrayWith([
              loadingState({ profileId: "profile-7", page: 17 }),
              loadedWith("Value: Even more fun stuff! for profile profile-7 on page 17"),
              loadingState({ profileId: "profile-7", page: 21 })
            ])))
        }),
        effect("the third subscriber gets the latest provided value and the loading update", (context) => {
          expect(context.valuesReceivedBy("sub-three"),
            is(arrayWith([
              loadedWith("Value: Even more fun stuff! for profile profile-7 on page 17"),
              loadingState({ profileId: "profile-7", page: 21 })
            ])))
        })
      ]
    })

interface StatefulProviderContext {
  counterState: State<TestProvidedState<string>>
  otherState: Container<number>
  provider: Provider
}

const reactiveQueryCountForProvider =
  example(testSubscriberContext<StatefulProviderContext>())
    .description("reactive query count for provider")
    .script({
      suppose: [
        fact("there is some state and a provider", (context) => {
          const counterState = container<TestProvidedState<string>>(withInitialValue({ type: "loading", value: "0" }))
          const otherState = container(withInitialValue(27))
          const anotherState = container(withInitialValue(22))
          const provider = new TestProvider<string>()
          let counter = 0
          provider.setHandler(async (get, set, _) => {
            counter = counter + 1
            const total = get(otherState) + get(anotherState)
            set(counterState, { type: "loaded", value: `${counter} - ${total}` })
          })
          useProvider(provider)
          context.setState({
            counterState,
            otherState,
            provider
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.state.counterState, "sub-one")
        })
      ],
      observe: [
        effect("the reactive query is executed only once on initialization", (context) => {
          expect(context.valuesReceivedBy("sub-one"), is(arrayWith([
            loadedWith("1 - 49")
          ])))
        })
      ]
    })
    .andThen({
      perform: [
        step("a state dependency is updated", (context) => {
          context.write(context.state.otherState, 14)
        })
      ],
      observe: [
        effect("the reactive query is executed once more", (context) => {
          expect(context.valuesReceivedBy("sub-one"), is(arrayWithItemAt(1, loadedWith("2 - 36"))))
        })
      ]
    })


interface DeferredDependencyContext {
  numberState: Container<number>,
  stringState: Container<string>,
  managedState: State<TestProvidedState<string>>
  provider: TestProvider<string>
}

const deferredDependency =
  example(testSubscriberContext<DeferredDependencyContext>())
    .description("dependency that is not used on first execution")
    .script({
      suppose: [
        fact("there is derived state with a dependency used only later", (context) => {
          const numberState = container(withInitialValue(6))
          const stringState = container(withInitialValue("hello"))
          const managedState = container<TestProvidedState<string>>(withInitialValue({ type: "unknown" }))
          const provider = new TestProvider<string>()
          provider.setHandler(async (get, set, _) => {
            if (get(stringState) === "now") {
              set(managedState, { type: "loaded", value: `Number ${get(numberState)}` })
            } else {
              set(managedState, { type: "loaded", value: `Number 0` })
            }
          })
          useProvider(provider)
          context.setState({
            numberState,
            stringState,
            managedState,
            provider
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.state.managedState, "sub-one")
        })
      ],
      perform: [
        step("the state is updated to expose the number", (context) => {
          context.write(context.state.stringState, "now")
        }),
        step("the number state updates", (context) => {
          context.write(context.state.numberState, 27)
        }),
        step("the string state updates to hide the number state", (context) => {
          context.write(context.state.stringState, "later")
        }),
        step("the number state updates again", (context) => {
          context.write(context.state.numberState, 14)
        })
      ],
      observe: [
        effect("the subscriber gets all the updates", (context) => {
          expect(context.valuesReceivedBy("sub-one"), is(arrayWith([
            loadedWith("Number 0"),
            loadedWith("Number 6"),
            loadedWith("Number 27"),
            loadedWith("Number 0"),
            loadedWith("Number 0")
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

function loadedWith(value: string): Matcher<TestProvidedState<string>> {
  return objectWith({
    type: equalTo("loaded"),
    value: equalTo(value)
  })
}

export default behavior("state provider", [
  simpleProvidedValue,
  providedValueWithDerivedKey,
  reactiveQueryCountForProvider,
  deferredDependency
])