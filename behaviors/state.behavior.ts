import { behavior, effect, example, fact, step } from "esbehavior";
import { Root, root, derive, State } from "../src/state";
import { arrayWith, equalTo, expect, is } from "great-expectations"

class StateContext<T> {
  private subscribers: Map<string, Array<T>> = new Map()

  constructor(public state: State<T>) {}

  subscribeToState(name: string) {
    this.state.onChange(() => {
      const value = this.state.read()
      const values = this.subscribers.get(name)
      if (values === undefined) {
        this.subscribers.set(name, [value])
      } else {
        values.push(value)
      }
    })
  }

  valuesReceivedBySubscriber(name: string): Array<T> {
    return this.subscribers.get(name) ?? []
  }
}

class RootContext<T> extends StateContext<T> {
  constructor(public root: Root<T>) {
    super(root)
  }
}

const subscribeAndUpdate =
  example({ init: () => new RootContext(root("hello")) })
    .description("Updating listeners")
    .script({
      perform: [
        step("a listener subscribes", (context) => {
          context.subscribeToState("subscriber-one")
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
          context.root.write("next")
        })
      ],
      observe: [
        effect("the listener receives the updated value", (context) => {
          expectValuesFor(context, "subscriber-one", [
            "hello",
            "next"
          ])
        })
      ]
    }).andThen({
      perform: [
        step("another listener subscribes", (context) => {
          context.subscribeToState("subscriber-two")
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
          context.root.write("finally")
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
  basic: RootContext<number>,
  derived?: StateContext<string>
  thirdLevel?: StateContext<number>
}

const derivedState =
  example({ init: () => {
    return {
      basic: new RootContext(root(17)),
    } as DerivedStateContext
  }})
    .description("Derivative State")
    .script({
      suppose: [
        fact("there is a derived state", (context) => {
          context.derived = new StateContext(derive((get) => `${get(context.basic.state)} things!`))
        })
      ],
      perform: [
        step("subscribe to the derived state", (context) => {
          context.derived!.subscribeToState("subscriber-one")
        })
      ],
      observe: [
        effect("the derived state's initial value is based on the root state", (context) => {
          expectValuesFor(context.derived!, "subscriber-one", [
            "17 things!"
          ])
        })
      ]
    }).andThen({
      perform: [
        step("the root state is updated", (context) => {
          context.basic.root.write(27)
        })
      ],
      observe: [
        effect("the derived state updates its subscribers with the new value", (context) => {
          expectValuesFor(context.derived!, "subscriber-one", [
            "17 things!",
            "27 things!"
          ])
        })
      ]
    }).andThen({
      perform: [
        step("a state is derived from the derived state", (context) => {
          context.thirdLevel = new StateContext(derive((get) => get(context.derived!.state).length))
          context.thirdLevel.subscribeToState("subscriber-two")
        }),
        step("a subscriber subscribed to the root state", (context) => {
          context.basic.subscribeToState("subscriber-three")
        })
      ],
      observe: [
        effect("the derived derived state subscriber gets the current value", (context) => {
          expectValuesFor(context.thirdLevel!, "subscriber-two", [
            10
          ])
        }),
        effect("the root subscriber gets the current value", (context) => {
          expectValuesFor(context.basic, "subscriber-three", [
            27
          ])
        })
      ]
    }).andThen({
      perform: [
        step("the root state is updated", (context) => {
          context.basic.root.write(8)
        })
      ],
      observe: [
        effect("the root subscriber gets the latest value", (context) => {
          expectValuesFor(context.basic, "subscriber-three", [
            27,
            8
          ])
        }),
        effect("the derived state subscriber gets the latest value", (context) => {
          expectValuesFor(context.derived!, "subscriber-one", [
            "17 things!",
            "27 things!",
            "8 things!"
          ])
        }),
        effect("the derived derived state subscriber gets the current value", (context) => {
          expectValuesFor(context.thirdLevel!, "subscriber-two", [
            10,
            9
          ])
        }),
      ]
    })

interface MultipleSourceStateContext {
  numberAtom: Root<number>
  stringAtom: Root<string>
  anotherAtom: Root<string>
  derived?: StateContext<string>
}

const multipleSourceState =
    example<MultipleSourceStateContext>({ init: () => ({
      numberAtom: root(27),
      stringAtom: root("hello"),
      anotherAtom: root("next")
    })})
      .description("Derived state with multiple sources")
      .script({
        perform: [
          step("a derived state is created from the root states", (context) => {
            context.derived = new StateContext(derive((get) => `${get(context.stringAtom)} ${get(context.numberAtom)} times. And then ${get(context.anotherAtom)}!`))
          })
        ],
        observe: [
          effect("the derived state has the expected initial state", (context) => {
            expect(context.derived!.state.read(), is(equalTo("hello 27 times. And then next!")))
          })
        ]
      }).andThen({
        perform: [
          step("subscribe to the derived state", (context) => {
            context.derived!.subscribeToState("subscriber-one")
          }),
          step("a root state is updated", (context) => {
            context.stringAtom.write("JUMP")
          })
        ],
        observe: [
          effect("the subscriber gets the update", (context) => {
            expectValuesFor(context.derived!, "subscriber-one", [
              "hello 27 times. And then next!",
              "JUMP 27 times. And then next!"
            ])
          })
        ]
      })

function expectValuesFor<T>(context: StateContext<T>, subscriber: string, values: Array<T>) {
  expect(context.valuesReceivedBySubscriber(subscriber), is(equalTo(values)))
}

// Note one thing to worry about here might be getting into an endless loop somehow ...

export default
  behavior("state", [
    subscribeAndUpdate,
    derivedState,
    multipleSourceState
  ])
