import { behavior, effect, example, fact, step } from "esbehavior";
import { Container, State } from "@src/loop.js";
import { arrayWithItemAt, equalTo, expect, is } from "great-expectations"
import { TestSubscriberContext, testSubscriberContext } from "./helpers/testSubscriberContext.js";
import { container, state, withInitialValue } from "@src/index.js";

interface SingleContainer {
  container: Container<string>
}

const subscribeAndUpdate =
  example(testSubscriberContext<SingleContainer>())
    .description("Updating listeners")
    .script({
      perform: [
        step("there is a root state", (context) => {
          context.setState({
            container: container(withInitialValue("hello"))
          })
        }),
        step("a listener subscribes", (context) => {
          context.subscribeTo(context.state.container, "subscriber-one")
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
          context.write(context.state.container, "next")
        })
      ],
      observe: [
        effect("the listener receives the updated value", (context) => {
          expect(context.valuesReceivedBy("subscriber-one"), is(arrayWithItemAt(1, equalTo("next"))))
        })
      ]
    }).andThen({
      perform: [
        step("another listener subscribes", (context) => {
          context.subscribeTo(context.state.container, "subscriber-two")
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
          context.write(context.state.container, "finally")
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

interface DerivedState {
  basic: Container<number>,
  derived?: State<string>
  thirdLevel?: State<number>
}

const derivedState =
  example(testSubscriberContext<DerivedState>())
    .description("Derivative State")
    .script({
      suppose: [
        fact("there is root and derived state", (context) => {
          const basic = container(withInitialValue(17))
          context.setState({
            basic,
            derived: state((get) => `${get(basic)} things!`)
          })
        }),
      ],
      perform: [
        step("subscribe to the derived state", (context) => {
          context.subscribeTo(context.state.derived!, "subscriber-one")
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
          context.write(context.state.basic, 27)
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
          context.setState({
            basic: context.state.basic,
            derived: context.state.derived,
            thirdLevel: state((get) => get(context.state.derived!).length)
          })
          context.subscribeTo(context.state.thirdLevel!, "subscriber-two")
        }),
        step("a subscriber subscribed to the root state", (context) => {
          context.subscribeTo(context.state.basic, "subscriber-three")
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
          context.write(context.state.basic, 8)
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
  derived: State<string>
}

const multipleSourceState =
  example(testSubscriberContext<MultipleSourceState>())
    .description("Derived state with multiple sources")
    .script({
      perform: [
        step("a derived state is created from the root states", (context) => {
          const numberAtom = container(withInitialValue(27))
          const stringAtom = container(withInitialValue("hello"))
          const anotherAtom = container(withInitialValue("next"))
          context.setState({
            numberAtom,
            stringAtom,
            anotherAtom,
            derived: state((get) => `${get(stringAtom)} ${get(numberAtom)} times. And then ${get(anotherAtom)}!`)
          })
        }),
        step("subscribe to the derived state", (context) => {
          context.subscribeTo(context.state.derived!, "subscriber-one")
        }),
        step("a root state is updated", (context) => {
          context.write(context.state.stringAtom, "JUMP")
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

const reactiveQueryCount =
  example(testSubscriberContext<MultipleSourceState>())
    .description("Reactive query count for derived state")
    .script({
      suppose: [
        fact("there is a derived state", (context) => {
          const numberAtom = container(withInitialValue(27))
          const stringAtom = container(withInitialValue("hello"))
          const anotherAtom = container(withInitialValue("next"))
          let counter = 0
          context.setState({
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
          context.subscribeTo(context.state.derived, "sub-one")
        })
      ],
      observe: [
        effect("the reactive query is called only once on initialization", (context) => {
          expect(context.valuesReceivedBy("sub-one"), is(equalTo([
            "1 => hello 27 times. And then next!"
          ])))
        })
      ]
    })
    .andThen({
      perform: [
        step("one dependency is updated", (context) => {
          context.write(context.state.numberAtom, 31)
        }),
        step("another dependency is updated", (context) => {
          context.write(context.state.stringAtom, "Some fun")
        })
      ],
      observe: [
        effect("the reactive query executes once for each update", (context) => {
          expect(context.valuesReceivedBy("sub-one"), is(equalTo([
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
  derivedState: State<number>
}

const deferredDependency =
  example(testSubscriberContext<DeferredDependencyContext>())
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
          context.setState({
            numberState,
            stringState,
            derivedState
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.state.derivedState, "sub-one")
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
          expect(context.valuesReceivedBy("sub-one"), is(equalTo([
            0,
            6,
            27,
            0,
            0
          ])))
        })
      ]
    })

function expectValuesFor<T>(context: TestSubscriberContext<T>, subscriber: string, values: Array<any>) {
  expect(context.valuesReceivedBy(subscriber), is(equalTo(values)))
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
