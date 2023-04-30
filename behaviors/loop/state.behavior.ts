import { ConfigurableExample, behavior, effect, example, fact, step } from "esbehavior";
import { arrayWithItemAt, equalTo, expect, is } from "great-expectations"
import { Container, DerivedState, container, state, withInitialValue } from "@src/store.js";
import { TestStore, testStoreContext } from "./helpers/testStore.js";

interface BasicContainerTokens {
  nameToken: Container<string>
}

const subscribeAndUpdate: ConfigurableExample =
  (m) => m.pick() && example(testStoreContext<BasicContainerTokens>())
    .description("Updating listeners")
    .script({
      perform: [
        step("there is a root state", (context) => {
          context.setTokens({
            nameToken: container(withInitialValue("hello"))
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

interface DerivedStateContext {
  basic: Container<number>,
  derived?: DerivedState<string>
  thirdLevel?: DerivedState<number>
}

const derivedState: ConfigurableExample =
  (m) => m.pick() && example(testStoreContext<DerivedStateContext>())
    .description("Derivative State")
    .script({
      suppose: [
        fact("there is root and derived state", (context) => {
          const basic = container(withInitialValue(17))
          context.setTokens({
            basic,
            derived: state((get) => `${get(basic)} things!`)
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
            thirdLevel: state((get) => get(context.tokens.derived!).length)
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

interface MultipleSourceState {
  numberAtom: Container<number>
  stringAtom: Container<string>
  anotherAtom: Container<string>
  derived: DerivedState<string>
}

const multipleSourceState: ConfigurableExample =
  (m) => m.pick() && example(testStoreContext<MultipleSourceState>())
    .description("Derived state with multiple sources")
    .script({
      perform: [
        step("a derived state is created from the root states", (context) => {
          const numberAtom = container(withInitialValue(27))
          const stringAtom = container(withInitialValue("hello"))
          const anotherAtom = container(withInitialValue("next"))
          context.setTokens({
            numberAtom,
            stringAtom,
            anotherAtom,
            derived: state((get) => `${get(stringAtom)} ${get(numberAtom)} times. And then ${get(anotherAtom)}!`)
          })
        }),
        step("subscribe to the derived state", (context) => {
          context.subscribeTo(context.tokens.derived!, "subscriber-one")
        }),
        step("a root state is updated", (context) => {
          context.writeTo(context.tokens.stringAtom, "JUMP")
        })
      ],
      observe: [
        effect("the subscriber gets the initial state and then the update", (context) => {
          expectValuesFor(context, "subscriber-one", [
            "hello 27 times. And then next!",
            "JUMP 27 times. And then next!"
          ])
        })
      ]
    })

const reactiveQueryCount: ConfigurableExample =
  (m) => m.pick() && example(testStoreContext<MultipleSourceState>())
    .description("Reactive query count for derived state")
    .script({
      suppose: [
        fact("there is a derived state", (context) => {
          const numberAtom = container(withInitialValue(27))
          const stringAtom = container(withInitialValue("hello"))
          const anotherAtom = container(withInitialValue("next"))
          let counter = 0
          context.setTokens({
            numberAtom,
            stringAtom,
            anotherAtom,
            derived: state((get) => {
              counter = counter + 1
              return `${counter} => ${get(stringAtom)} ${get(numberAtom)} times. And then ${get(anotherAtom)}!`
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
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "1 => hello 27 times. And then next!",
            "2 => hello 31 times. And then next!",
            "3 => Some fun 31 times. And then next!",
          ])))
        })
      ]
    })

interface DeferredDependencyContext {
  numberState: Container<number>,
  stringState: Container<string>,
  derivedState: DerivedState<number>
}

const deferredDependency: ConfigurableExample =
  (m) => m.pick() && example(testStoreContext<DeferredDependencyContext>())
    .description("dependency that is not used on first execution")
    .script({
      suppose: [
        fact("there is derived state with a dependency used only later", (context) => {
          const numberState = container(withInitialValue(6))
          const stringState = container(withInitialValue("hello"))
          const derivedState = state((get) => {
            if (get(stringState) === "now") {
              return get(numberState)
            } else {
              return 0
            }
          })
          context.setTokens({
            numberState,
            stringState,
            derivedState
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.tokens.derivedState, "sub-one")
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
            0,
            6,
            27,
            0,
            0
          ])))
        })
      ]
    })

function expectValuesFor<T>(context: TestStore<T>, subscriber: string, values: Array<any>) {
  expect(context.valuesForSubscriber(subscriber), is(equalTo(values)))
}

// Note one thing to worry about here might be getting into an endless loop somehow ...

export default
  behavior("state", [
    subscribeAndUpdate,
    derivedState,
    multipleSourceState,
    reactiveQueryCount,
    deferredDependency
  ])
