import { ConfigurableExample, behavior, effect, example, fact, step } from "esbehavior";
import { arrayWith, arrayWithItemAt, equalTo, expect, is } from "great-expectations";
// import { testSubscriberContext } from "./helpers/testSubscriberContext.js";
import { TestProvider } from "./helpers/testProvider.js";
// import { Container, container, meta, ok, pending, Provider, State, state, useProvider, withInitialValue } from "@src/index.js";
import { okMessage, pendingMessage } from "./helpers/metaMatchers.js";
import { testStoreContext } from "./helpers/testStore.js";
import { Container, Provider, DerivedState, container, ok, pending, state, withInitialValue } from "@src/store.js";

interface ProvidedValueContext {
  receiver: DerivedState<string>
  provider: TestProvider<string>
}

const simpleProvidedValue: ConfigurableExample =
  (m) => m.pick() && example(testStoreContext<ProvidedValueContext>())
    .description("view with simple provided value")
    .script({
      suppose: [
        fact("there is a view with a provided value", (context) => {
          const receiver = state<string>(() => "initial")
          const provider = new TestProvider<string>()
          provider.setHandler(async (_, set, waitFor) => {
            console.log("running provider!")
            set(receiver.meta, pending("loading"))
            const value = await waitFor()
            set(receiver.meta, ok(value))
          })
          context.useProvider(provider)
          context.setTokens({
            receiver,
            provider
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.tokens.receiver, "sub-one")
        }),
        fact("there is a meta subscriber", (context) => {
          context.subscribeTo(context.tokens.receiver.meta, "meta-sub")
        })
      ],
      observe: [
        effect("the subscriber receives the initial message", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "initial"
          ])))
        }),
        effect("the meta subscriber receives a pending message", (context) => {
          expect(context.valuesForSubscriber("meta-sub"), is(arrayWith([
            pendingMessage("loading")
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the provided value loads", (context) => {
          context.tokens.provider.resolver?.("funny")
        })
      ],
      observe: [
        effect("the subscriber receives the provided value", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "initial",
            "funny"
          ])))
        }),
        effect("the meta subscriber receives an ok message", (context) => {
          expect(context.valuesForSubscriber("meta-sub"), is(arrayWith([
            pendingMessage("loading"),
            okMessage("funny")
          ])))
        })
      ]
    })

interface ProvidedValueWithKeyContext {
  profileState: Container<string>,
  pageNumberState: Container<number>,
  receiver: Container<string>
  provider: TestProvider<string>
}

const providedValueWithDerivedKey: ConfigurableExample =
  (m) => m.pick() && example(testStoreContext<ProvidedValueWithKeyContext>())
    .description("provided value with derived key")
    .script({
      suppose: [
        fact("there is a view with a provided value", (context) => {
          const profileState = container(withInitialValue("profile-1"))
          const pageNumberState = container(withInitialValue(17))
          const receiver = container<string>(withInitialValue("initial"))
          const provider = new TestProvider<string>()
          provider.setHandler(async (get, set, waitFor) => {
            const key = {
              profileId: get(profileState),
              page: get(pageNumberState)
            }
            set(receiver.meta, pending(`Value for profile ${key.profileId} on page ${key.page}`))
            const extraValue = await waitFor()
            set(receiver.meta, ok(`Value: ${extraValue} for profile ${key.profileId} on page ${key.page}`))
          })
          context.useProvider(provider)
          context.setTokens({
            profileState,
            pageNumberState,
            receiver,
            provider
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.tokens.receiver, "sub-one")
        }),
        fact("there is a meta-subscriber", (context) => {
          context.subscribeTo(context.tokens.receiver.meta, "meta-sub")
        })
      ],
      observe: [
        effect("the current key is used", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "initial",
          ])))
        }),
        effect("the meta subscriber gets the pending message", (context) => {
          expect(context.valuesForSubscriber("meta-sub"), is(arrayWith([
            pendingMessage("Value for profile profile-1 on page 17"),
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the provided value loads", (context) => {
          context.tokens.provider.resolver?.("Fun Stuff")
        }),
        step("the key changes", (context) => {
          context.writeTo(context.tokens.profileState, "profile-7")
        })
      ],
      observe: [
        effect("the receiver gets the written value", (context) => {
          expect(context.valuesForSubscriber("sub-one"),
            is(equalTo([
              "initial",
              "Value: Fun Stuff for profile profile-1 on page 17"
            ])))
        }),
        effect("the meta subscriber gets the pending message again", (context) => {
          expect(context.valuesForSubscriber("meta-sub"), is(arrayWith([
            pendingMessage("Value for profile profile-1 on page 17"),
            okMessage("Value: Fun Stuff for profile profile-1 on page 17"),
            pendingMessage("Value for profile profile-7 on page 17")
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("another subscriber joins", (context) => {
          context.subscribeTo(context.tokens.receiver, "sub-two")
        })
      ],
      observe: [
        effect("the subscriber gets the latest written value", (context) => {
          expect(context.valuesForSubscriber("sub-two"), is(equalTo([
            "Value: Fun Stuff for profile profile-1 on page 17"
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the provided value is updated", (context) => {
          context.tokens.provider.resolver?.("Even more fun stuff!")
        })
      ],
      observe: [
        effect("subscriber-one gets the update", (context) => {
          expect(context.valuesForSubscriber("sub-one"),
            is(equalTo([
              "initial",
              "Value: Fun Stuff for profile profile-1 on page 17",
              "Value: Even more fun stuff! for profile profile-7 on page 17"
            ])))
        }),
        effect("subscriber-two gets the update", (context) => {
          expect(context.valuesForSubscriber("sub-two"),
            is(equalTo([
              "Value: Fun Stuff for profile profile-1 on page 17",
              "Value: Even more fun stuff! for profile profile-7 on page 17"
            ])))
        }),
        effect("the meta subscriber gets the ok message", (context) => {
          expect(context.valuesForSubscriber("meta-sub"), is(arrayWith([
            pendingMessage("Value for profile profile-1 on page 17"),
            okMessage("Value: Fun Stuff for profile profile-1 on page 17"),
            pendingMessage("Value for profile profile-7 on page 17"),
            okMessage("Value: Even more fun stuff! for profile profile-7 on page 17")
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("a third subscriber joins", (context) => {
          context.subscribeTo(context.tokens.receiver, "sub-three")
        }),
        step("a state dependency is updated", (context) => {
          context.writeTo(context.tokens.pageNumberState, 21)
        })
      ],
      observe: [
        effect("subscriber-one receives no message yet", (context) => {
          expect(context.valuesForSubscriber("sub-one"),
            is(equalTo([
              "initial",
              "Value: Fun Stuff for profile profile-1 on page 17",
              "Value: Even more fun stuff! for profile profile-7 on page 17"
            ])))
        }),
        effect("subscriber-two receives no message yet", (context) => {
          expect(context.valuesForSubscriber("sub-two"),
            is(equalTo([
              "Value: Fun Stuff for profile profile-1 on page 17",
              "Value: Even more fun stuff! for profile profile-7 on page 17"
            ])))
        }),
        effect("the third subscriber gets the latest written value", (context) => {
          expect(context.valuesForSubscriber("sub-three"),
            is(equalTo([
              "Value: Even more fun stuff! for profile profile-7 on page 17"
            ])))
        }),
        effect("the meta subscriber gets the loading message again", (context) => {
          expect(context.valuesForSubscriber("meta-sub"), is(arrayWith([
            pendingMessage("Value for profile profile-1 on page 17"),
            okMessage("Value: Fun Stuff for profile profile-1 on page 17"),
            pendingMessage("Value for profile profile-7 on page 17"),
            okMessage("Value: Even more fun stuff! for profile profile-7 on page 17"),
            pendingMessage("Value for profile profile-7 on page 21")
          ])))
        })
      ]
    })

interface StatefulProviderContext {
  counterState: Container<string>
  otherState: Container<number>
  provider: Provider
}

const reactiveQueryCountForProvider: ConfigurableExample =
  (m) => m.pick() && example(testStoreContext<StatefulProviderContext>())
    .description("reactive query count for provider")
    .script({
      suppose: [
        fact("there is some state and a provider", (context) => {
          const counterState = container<string>(withInitialValue("0"))
          const otherState = container(withInitialValue(27))
          const anotherState = container(withInitialValue(22))
          const provider = new TestProvider<string>()
          let counter = 0
          provider.setHandler(async (get, set, _) => {
            counter = counter + 1
            const total = get(otherState) + get(anotherState)
            set(counterState.meta, ok(`${counter} - ${total}`))
          })
          context.useProvider(provider)
          context.setTokens({
            counterState,
            otherState,
            provider
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.tokens.counterState, "sub-one")
        })
      ],
      observe: [
        effect("the reactive query is executed only once on initialization", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "1 - 49"
          ])))
        })
      ]
    })
    .andThen({
      perform: [
        step("a state dependency is updated", (context) => {
          context.writeTo(context.tokens.otherState, 14)
        })
      ],
      observe: [
        effect("the reactive query is executed once more", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(arrayWithItemAt(1, equalTo("2 - 36"))))
        })
      ]
    })


interface DeferredDependencyContext {
  numberState: Container<number>,
  stringState: Container<string>,
  managedState: Container<string>
  provider: TestProvider<string>
}

const deferredDependency: ConfigurableExample =
  (m) => m.pick() && example(testStoreContext<DeferredDependencyContext>())
    .description("dependency that is not used on first execution")
    .script({
      suppose: [
        fact("there is derived state with a dependency used only later", (context) => {
          const numberState = container(withInitialValue(6))
          const stringState = container(withInitialValue("hello"))
          const managedState = container<string>(withInitialValue("initial"))
          const provider = new TestProvider<string>()
          provider.setHandler(async (get, set, _) => {
            if (get(stringState) === "now") {
              set(managedState.meta, ok(`Number ${get(numberState)}`))
            } else {
              set(managedState.meta, ok(`Number 0`))
            }
          })
          context.useProvider(provider)
          context.setTokens({
            numberState,
            stringState,
            managedState,
            provider
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.tokens.managedState, "sub-one")
        })
      ],
      perform: [
        step("the state is updated to expose the number", (context) => {
          context.writeTo(context.tokens.stringState, "now")
        }),
        step("the number state updates", (context) => {
          context.writeTo(context.tokens.numberState, 27)
        }),
        step("the string state updates to hide the number state", (context) => {
          context.writeTo(context.tokens.stringState, "later")
        }),
        step("the number state updates again", (context) => {
          context.writeTo(context.tokens.numberState, 14)
        })
      ],
      observe: [
        effect("the subscriber gets all the updates", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "Number 0",
            "Number 6",
            "Number 27",
            "Number 0",
            "Number 0"
          ])))
        })
      ]
    })

export default behavior("state provider", [
  simpleProvidedValue,
  providedValueWithDerivedKey,
  reactiveQueryCountForProvider,
  deferredDependency
])