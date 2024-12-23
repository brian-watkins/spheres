import { ConfigurableExample, behavior, effect, example, fact, step } from "best-behavior";
import { arrayWithItemAt, equalTo, expect, is } from "great-expectations"
import { Container, DerivedState, container, derived } from "@src/index.js";
import { TestStore, testStoreContext } from "./helpers/testStore.js";

interface BasicContainerTokens {
  nameToken: Container<string>
}

const subscribeAndUpdate: ConfigurableExample =
  example(testStoreContext<BasicContainerTokens>())
    .description("Updating listeners")
    .script({
      perform: [
        step("there is a root state", (context) => {
          context.setTokens({
            nameToken: container({ initialValue: "hello" })
          })
        }),
        step("a listener subscribes", (context) => {
          context.subscribeTo(context.tokens.nameToken, "subscriber-one")
        })
      ],
      observe: [
        effect("the listener receives the initial value", (context) => {
          expectValuesFor(context, "subscriber-one", [
            "hello"
          ])
        })
      ]
    }).andThen({
      perform: [
        step("the root state is updated", (context) => {
          context.writeTo(context.tokens.nameToken, "next")
        })
      ],
      observe: [
        effect("the listener receives the updated value", (context) => {
          expect(context.valuesForSubscriber("subscriber-one"), is(arrayWithItemAt(1, equalTo("next"))))
        })
      ]
    }).andThen({
      perform: [
        step("another listener subscribes", (context) => {
          context.subscribeTo(context.tokens.nameToken, "subscriber-two")
        })
      ],
      observe: [
        effect("the first subscriber is not updated", (context) => {
          expectValuesFor(context, "subscriber-one", [
            "hello",
            "next"
          ])
        }),
        effect("the second subscriber gets the latest value", (context) => {
          expectValuesFor(context, "subscriber-two", [
            "next"
          ])
        })
      ]
    }).andThen({
      perform: [
        step("the root state is updated again", (context) => {
          context.writeTo(context.tokens.nameToken, "finally")
        })
      ],
      observe: [
        effect("both subscribers are updated with the latest value", (context) => {
          expectValuesFor(context, "subscriber-one", [
            "hello",
            "next",
            "finally"
          ])
          expectValuesFor(context, "subscriber-two", [
            "next",
            "finally"
          ])
        })
      ]
    })

const lateSubscriber: ConfigurableExample =
  example(testStoreContext<BasicContainerTokens>())
    .description("subscribing after the container has been written to")
    .script({
      suppose: [
        fact("there is a root state", (context) => {
          context.setTokens({
            nameToken: container({ initialValue: "hello" })
          })
        })
      ],
      perform: [
        step("a value is written to the container", (context) => {
          context.writeTo(context.tokens.nameToken, "Cool stuff!")
        }),
        step("someone subscribes to the state", (context) => {
          context.subscribeTo(context.tokens.nameToken, "sub-one")
        })
      ],
      observe: [
        effect("the subscriber receives the last written value", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "Cool stuff!"
          ])))
        })
      ]
    })

interface DerivedStateContext {
  basic: Container<number>,
  derived?: DerivedState<string>
  thirdLevel?: DerivedState<number>
}

const derivedState: ConfigurableExample =
  example(testStoreContext<DerivedStateContext>())
    .description("Derivative State")
    .script({
      suppose: [
        fact("there is root and derived state", (context) => {
          const basic = container({ initialValue: 17 })
          context.setTokens({
            basic,
            derived: derived({
              query: (get) => `${get(basic)} things!`
            })
          })
        }),
      ],
      perform: [
        step("subscribe to the derived state", (context) => {
          context.subscribeTo(context.tokens.derived!, "subscriber-one")
        })
      ],
      observe: [
        effect("the derived state's initial value is based on the root state", (context) => {
          expectValuesFor(context, "subscriber-one", [
            "17 things!"
          ])
        })
      ]
    }).andThen({
      perform: [
        step("the root state is updated", (context) => {
          context.writeTo(context.tokens.basic, 27)
        })
      ],
      observe: [
        effect("the derived state updates its subscribers with the new value", (context) => {
          expectValuesFor(context, "subscriber-one", [
            "17 things!",
            "27 things!"
          ])
        })
      ]
    }).andThen({
      perform: [
        step("a state is derived from the derived state", (context) => {
          context.setTokens({
            basic: context.tokens.basic,
            derived: context.tokens.derived,
            thirdLevel: derived({
              query: (get) => get(context.tokens.derived!).length
            })
          })
          context.subscribeTo(context.tokens.thirdLevel!, "subscriber-two")
        }),
        step("a subscriber subscribed to the root state", (context) => {
          context.subscribeTo(context.tokens.basic, "subscriber-three")
        })
      ],
      observe: [
        effect("the derived derived state subscriber gets the current value", (context) => {
          expectValuesFor(context, "subscriber-two", [
            10
          ])
        }),
        effect("the root subscriber gets the current value", (context) => {
          expectValuesFor(context, "subscriber-three", [
            27
          ])
        })
      ]
    }).andThen({
      perform: [
        step("the root state is updated", (context) => {
          context.writeTo(context.tokens.basic, 8)
        })
      ],
      observe: [
        effect("the root subscriber gets the latest value", (context) => {
          expectValuesFor(context, "subscriber-three", [
            27,
            8
          ])
        }),
        effect("the derived state subscriber gets the latest value", (context) => {
          expectValuesFor(context, "subscriber-one", [
            "17 things!",
            "27 things!",
            "8 things!"
          ])
        }),
        effect("the derived derived state subscriber gets the current value", (context) => {
          expectValuesFor(context, "subscriber-two", [
            10,
            9
          ])
        }),
      ]
    })

interface DerivedStateHiddenDepsContext {
  numberContainer: Container<number>
  stringContainer: Container<string>
  derived: DerivedState<string>
  calls: number
}

const derivedStateWithHiddenDependencies: ConfigurableExample =
  example(testStoreContext<DerivedStateHiddenDepsContext>())
    .description("derived state with hidden dependencies")
    .script({
      suppose: [
        fact("there is derived state with hidden dependencies", (context) => {
          context.setTokens({
            numberContainer: container({ initialValue: 0 }),
            stringContainer: container({ initialValue: "hello" }),
            derived: derived({
              query: (get) => {
                context.tokens.calls++
                if (get(context.tokens.stringContainer) === "show-number") {
                  return `Number: ${get(context.tokens.numberContainer)}`
                } else {
                  return get(context.tokens.stringContainer)
                }
              }
            }),
            calls: 0
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.tokens.derived, "sub-one")
        })
      ],
      perform: [
        step("the hidden dependency is written to", (context) => {
          context.writeTo(context.tokens.numberContainer, 34)
        }),
        step("the hidden dependency is exposed", (context) => {
          context.writeTo(context.tokens.stringContainer, "show-number")
        }),
        step("the hidden dependency is written to", (context) => {
          context.writeTo(context.tokens.numberContainer, 11)
        }),
        step("the hidden dependency is hidden", (context) => {
          context.writeTo(context.tokens.stringContainer, "goodbye")
        }),
        step("the hidden dependency is written to", (context) => {
          context.writeTo(context.tokens.numberContainer, 67)
        }),
        step("the hidden dependency is written to again", (context) => {
          context.writeTo(context.tokens.numberContainer, 68)
        })
      ],
      observe: [
        effect("the subscriber gets the expected messages", (context) => {
          expectValuesFor(context, "sub-one", [
            "hello",
            "Number: 34",
            "Number: 11",
            "goodbye"
          ])
        }),
        effect("the minimum number of calls occurred", (context) => {
          expect(context.tokens.calls, is(4))
        })
      ]
    })

interface MultipleSourceState {
  numberAtom: Container<number>
  stringAtom: Container<string>
  anotherAtom: Container<string>
  derived: DerivedState<string>
}

const multipleSourceState: ConfigurableExample =
  example(testStoreContext<MultipleSourceState>())
    .description("Derived state with multiple sources")
    .script({
      perform: [
        step("a derived state is created from the root states", (context) => {
          const numberAtom = container({ initialValue: 27 })
          const stringAtom = container({ initialValue: "hello" })
          const anotherAtom = container({ initialValue: "next" })
          context.setTokens({
            numberAtom,
            stringAtom,
            anotherAtom,
            derived: derived({
              query: (get) => `${get(stringAtom)} ${get(numberAtom)} times. And then ${get(anotherAtom)}!`
            })
          })
        }),
        step("subscribe to the derived state", (context) => {
          context.subscribeTo(context.tokens.derived!, "subscriber-one")
        }),
        step("a root state is updated", (context) => {
          context.writeTo(context.tokens.stringAtom, "JUMP")
        }),
        step("another root state is updated", (context) => {
          context.writeTo(context.tokens.numberAtom, 14)
        }),
        step("another root state is updated", (context) => {
          context.writeTo(context.tokens.anotherAtom, "STOP")
        }),
      ],
      observe: [
        effect("the subscriber gets the initial state and then the update", (context) => {
          expectValuesFor(context, "subscriber-one", [
            "hello 27 times. And then next!",
            "JUMP 27 times. And then next!",
            "JUMP 14 times. And then next!",
            "JUMP 14 times. And then STOP!",
          ])
        })
      ]
    })

const reactiveQueryCount: ConfigurableExample =
  example(testStoreContext<MultipleSourceState>())
    .description("Reactive query count for derived state")
    .script({
      suppose: [
        fact("there is a derived state", (context) => {
          const numberAtom = container({ initialValue: 27 })
          const stringAtom = container({ initialValue: "hello" })
          const anotherAtom = container({ initialValue: "next" })
          let counter = 0
          context.setTokens({
            numberAtom,
            stringAtom,
            anotherAtom,
            derived: derived({
              query: (get) => {
                counter = counter + 1
                return `${counter} => ${get(stringAtom)} ${get(numberAtom)} times. And then ${get(anotherAtom)}!`
              }
            })
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.tokens.derived, "sub-one")
        })
      ],
      observe: [
        effect("the reactive query is called only once on initialization", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "1 => hello 27 times. And then next!"
          ])))
        })
      ]
    })
    .andThen({
      perform: [
        step("one dependency is updated", (context) => {
          context.writeTo(context.tokens.numberAtom, 31)
        }),
        step("another dependency is updated", (context) => {
          context.writeTo(context.tokens.stringAtom, "Some fun")
        })
      ],
      observe: [
        effect("the reactive query executes once for each update", (context) => {
          expectValuesFor(context, "sub-one", [
            "1 => hello 27 times. And then next!",
            "2 => hello 31 times. And then next!",
            "3 => Some fun 31 times. And then next!",
          ])
        })
      ]
    })

interface DeferredDependencyContext {
  numberState: Container<number>,
  stringState: Container<string>,
  derivedState: DerivedState<number>,
  queryCount: number
}

const deferredDependency: ConfigurableExample =
  example(testStoreContext<DeferredDependencyContext>())
    .description("dependency that is not used on first execution")
    .script({
      suppose: [
        fact("there is derived state with a dependency used only later", (context) => {
          const numberState = container({ initialValue: 6 })
          const stringState = container({ initialValue: "hello" })
          const derivedState = derived({
            query: (get) => {
              context.tokens.queryCount = context.tokens.queryCount + 1
              if (get(stringState) === "now") {
                return get(numberState)
              } else {
                return 0
              }
            }
          })
          context.setTokens({
            numberState,
            stringState,
            derivedState,
            queryCount: 0
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.tokens.derivedState, "sub-one")
        })
      ],
      perform: [
        step("the number state updates", (context) => {
          context.writeTo(context.tokens.numberState, 11)
        }),
        step("the state is updated to expose the number", (context) => {
          context.writeTo(context.tokens.stringState, "now")
        }),
        step("the number state updates", (context) => {
          context.writeTo(context.tokens.numberState, 27)
        }),
        step("the string state updates to hide the number state", (context) => {
          context.writeTo(context.tokens.stringState, "later")
        }),
        step("the number state updates again, which does not result in a new value", (context) => {
          context.writeTo(context.tokens.numberState, 14)
          context.writeTo(context.tokens.numberState, 27)
        })
      ],
      observe: [
        effect("the subscriber gets all the updates", (context) => {
          expectValuesFor(context, "sub-one", [
            0,
            11,
            27,
            0
          ])
        }),
        effect("the query is executed only when currently subscribed dependencies update", (context) => {
          expect(context.tokens.queryCount, is(4))
        })
      ]
    })

interface DerivedStateSubscribersContext {
  stringContainer: Container<string>
  numberContainer: Container<number>
  ultimateState: DerivedState<string>
  queryCount: number
}

const derivedStateSubscribers: ConfigurableExample =
  example(testStoreContext<DerivedStateSubscribersContext>())
    .description("derived state with subscribers that are sometimes hidden")
    .script({
      suppose: [
        fact("there is derived state that depends on other derived state sometimes", (context) => {
          const stringContainer = container({ initialValue: "hello" })
          const numberContainer = container({ initialValue: 0 })
          const derivedStringContainer = derived(get => `derived from: ${get(stringContainer)}`)
          const derivedNumberContainer = derived(get => get(numberContainer) + 100)
          const ultimateState = derived(get => {
            context.tokens.queryCount++
            if (get(derivedStringContainer).includes("show")) {
              return `The count is ${get(derivedNumberContainer)}`
            } else {
              return `The message is ${get(derivedStringContainer)}`
            }
          })
          context.setTokens({
            stringContainer,
            numberContainer,
            ultimateState,
            queryCount: 0
          })
        }),
        fact("there is a subscriber to the ultimate state", (context) => {
          context.subscribeTo(context.tokens.ultimateState, "sub-one")
        })
      ],
      perform: [
        step("the number container updates", (context) => {
          context.writeTo(context.tokens.numberContainer, 1)
          context.writeTo(context.tokens.numberContainer, 3)
        }),
        step("the string container updates and the ultimate state subscribes to the number container also", (context) => {
          context.writeTo(context.tokens.stringContainer, "show me")
        }),
        step("the number container updates", (context) => {
          context.writeTo(context.tokens.numberContainer, 6)
        }),
        step("the string container updates and the ultimate state forgets the number container dependency", (context) => {
          context.writeTo(context.tokens.stringContainer, "hide it")
        }),
        step("the number container updates", (context) => {
          context.writeTo(context.tokens.numberContainer, 4)
          context.writeTo(context.tokens.numberContainer, 9)
          context.writeTo(context.tokens.numberContainer, 17)
        })
      ],
      observe: [
        effect("the subscriber receives the expected values", (context) => {
          expectValuesFor(context, "sub-one", [
            "The message is derived from: hello",
            "The count is 103",
            "The count is 106",
            "The message is derived from: hide it"
          ])
        }),
        effect("the ultimate query is called only when current dependencies are updated", (context) => {
          expect(context.tokens.queryCount, is(4))
        })
      ]
    }).andThen({
      perform: [
        step("the string container updates and the ultimate state resubscribes to the number container", (context) => {
          context.writeTo(context.tokens.stringContainer, "show me")
        }),
        step("the number container updates", (context) => {
          context.writeTo(context.tokens.numberContainer, 27)
        })
      ],
      observe: [
        effect("the subscriber receives the latest values derived from the number container", (context) => {
          expectValuesFor(context, "sub-one", [
            "The message is derived from: hello",
            "The count is 103",
            "The count is 106",
            "The message is derived from: hide it",
            "The count is 117",
            "The count is 127"
          ])
        }),
        effect("the ultimate query is called only when current dependencies are updated", (context) => {
          expect(context.tokens.queryCount, is(6))
        })
      ]
    })

function expectValuesFor<T>(context: TestStore<T>, subscriber: string, values: Array<any>) {
  expect(context.valuesForSubscriber(subscriber), is(equalTo(values)))
}

export default
  behavior("state", [
    subscribeAndUpdate,
    lateSubscriber,
    derivedState,
    multipleSourceState,
    reactiveQueryCount,
    deferredDependency,
    derivedStateWithHiddenDependencies,
    derivedStateSubscribers
  ])
