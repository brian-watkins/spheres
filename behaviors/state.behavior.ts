import { behavior, effect, example, fact, step } from "esbehavior";
import { Container, container, derive, State } from "../src/state";
import { arrayWithItemAt, equalTo, expect, is } from "great-expectations"
import { TestSubscriberContext, testSubscriberContext } from "./helpers/testSubscriberContext";

interface SingleContainer {
  container: Container<string>
}

const subscribeAndUpdate =
  example(testSubscriberContext<SingleContainer>())
    .description("Updating listeners")
    .script({
      perform: [
        step("there is a root state", (context) => {
          context.setState((loop) => ({
            container: container(loop, "hello")
          }))
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
          context.updateState(context.state.container, "next")
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
          context.updateState(context.state.container, "finally")
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
          context.setState((loop) => {
            const basic = container(loop, 17)
            return {
              basic,
              derived: derive(loop, (get) => `${get(basic)} things!`)
            }
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
          context.updateState(context.state.basic, 27)
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
          context.setState((loop) => {
            return {
              basic: context.state.basic,
              derived: context.state.derived,
              thirdLevel: derive(loop, (get) => get(context.state.derived!).length)
            }
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
          context.updateState(context.state.basic, 8)
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
  derived?: State<string>
}

const multipleSourceState =
  example(testSubscriberContext<MultipleSourceState>())
    .description("Derived state with multiple sources")
    .script({
      perform: [
        step("a derived state is created from the root states", (context) => {
          context.setState((loop) => {
            const numberAtom = container(loop, 27)
            const stringAtom = container(loop, "hello")
            const anotherAtom = container(loop, "next")
            return {
              numberAtom,
              stringAtom,
              anotherAtom,
              derived: derive(loop, (get) => `${get(stringAtom)} ${get(numberAtom)} times. And then ${get(anotherAtom)}!`)
            }
          })
        }),
        step("subscribe to the derived state", (context) => {
          context.subscribeTo(context.state.derived!, "subscriber-one")
        }),
        step("a root state is updated", (context) => {
          context.updateState(context.state.stringAtom, "JUMP")
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

function expectValuesFor<T>(context: TestSubscriberContext<T>, subscriber: string, values: Array<any>) {
  expect(context.valuesReceivedBy(subscriber), is(equalTo(values)))
}

// Note one thing to worry about here might be getting into an endless loop somehow ...

export default
  behavior("state", [
    subscribeAndUpdate,
    derivedState,
    multipleSourceState
  ])
