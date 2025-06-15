import { container, initialize, supplied, write } from "@store/index.js";
import { behavior, effect, example, step } from "best-behavior";
import { arrayWith, equalTo, expect, is, objectWithProperty } from "great-expectations";
import { errorMessage, okMessage, pendingMessage } from "./helpers/metaMatchers";
import { testStoreContext } from "./helpers/testStore";

export default behavior("initialize state", [

  example(testStoreContext())
    .description("set initial values for tokens")
    .script({
      perform: [
        step("initialize the store", async (context) => {
          await context.initialize((actions) => {
            return new Promise<void>(resolve => setTimeout(() => {
              actions.supply(testContainer, "Fun Stuff!")
              resolve()
            }, 10))
          })
        }),
        step("subscribe to updates on the container", (context) => {
          context.subscribeTo(testContainer, "sub-1")
        }),
        step("dispatch a message to the container", (context) => {
          context.store.dispatch(write(testContainer, {
            action: "yo yo yo!"
          }))
        })
      ],
      observe: [
        effect("the subscriber gets the expected values for the token", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            "Fun Stuff!",
            "yo yo yo!"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("use existing state in initialization", (context) => {
          context.initialize((actions) => {
            const length = actions.get(testContainer).length
            actions.supply(anotherTestContainer, length)
          })
        }),
        step("there is a subscriber to the new state", (context) => {
          context.subscribeTo(anotherTestContainer, "sub-2")
        })
      ],
      observe: [
        effect("the subscriber gets the newly initialized state", (context) => {
          expect(context.valuesForSubscriber("sub-2"), is([
            9
          ]))
        })
      ]
    }),

  example(testStoreContext())
    .description("set pending values for container upon initialization")
    .script({
      perform: [
        step("initialize meta container values", async (context) => {
          await initialize(context.store, async (actions) => {
            actions.pending(testContainer, { action: "Loading!" })
          })
        }),
        step("subscribe to updates on the container", (context) => {
          context.subscribeTo(testContainer, "sub-1")
        }),
        step("subscribe to updates on the meta container", (context) => {
          context.subscribeTo(testContainer.meta, "sub-meta")
        }),
      ],
      observe: [
        effect("the subscriber gets the initial value of the token", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            "Initial"
          ]))
        }),
        effect("the meta subscriber gets the initial values", (context) => {
          expect(context.valuesForSubscriber("sub-meta"), is(arrayWith([
            pendingMessage({ action: "Loading!" })
          ])))
        })
      ]
    }),

  example(testStoreContext())
    .description("set error values for container upon initialization")
    .script({
      perform: [
        step("initialize meta container values", async (context) => {
          await context.initialize(async (actions) => {
            actions.error(testContainer, "No reason!", { action: "Loading!" })
          })
        }),
        step("subscribe to updates on the container", (context) => {
          context.subscribeTo(testContainer, "sub-1")
        }),
        step("subscribe to updates on the meta container", (context) => {
          context.subscribeTo(testContainer.meta, "sub-meta")
        }),
      ],
      observe: [
        effect("the subscriber gets the initial value of the token", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            "Initial"
          ]))
        }),
        effect("the meta subscriber gets the initial values", (context) => {
          expect(context.valuesForSubscriber("sub-meta"), is(arrayWith([
            errorMessage({ action: "Loading!" }, "No reason!")
          ])))
        })
      ]
    }),

  example(testStoreContext())
    .description("initialize readonly container")
    .script({
      perform: [
        step("initialize readonly container pending state", (context) => {
          context.initialize(actions => {
            actions.pending(readonlyContainer)
          })
        }),
        step("there is a subscriber to the container", (context) => {
          context.subscribeTo(readonlyContainer, "sub-1")
        }),
        step("there is a subscriber to the associated meta container", (context) => {
          context.subscribeTo(readonlyContainer.meta, "sub-meta")
        })
      ],
      observe: [
        effect("the subscriber receives the initial value only", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            17
          ]))
        }),
        effect("the meta subscriber receives the pending message", (context) => {
          expect(context.valuesForSubscriber("sub-meta"), is(arrayWith([
            pendingMessage(undefined)
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("initialize with an error", (context) => {
          context.initialize(actions => {
            actions.error(readonlyContainer, "It failed!")
          })
        })
      ],
      observe: [
        effect("the subscriber receives the initial value only", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            17
          ]))
        }),
        effect("the meta subscriber receives the error message", (context) => {
          expect(context.valuesForSubscriber("sub-meta"), is(arrayWith([
            objectWithProperty("type", equalTo("pending")),
            errorMessage(undefined, "It failed!")
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("a value is supplied", (context) => {
          context.initialize(actions => {
            actions.supply(readonlyContainer, 31)
          })
        })
      ],
      observe: [
        effect("the subscriber receives the supplied value", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            17,
            31
          ]))
        }),
        effect("the meta subscriber receives the ok message", (context) => {
          expect(context.valuesForSubscriber("sub-meta"), is(arrayWith([
            pendingMessage(undefined),
            errorMessage(undefined, "It failed!"),
            okMessage()
          ])))
        })
      ]
    })

])

interface TestMessage {
  action: string
}

const testContainer = container<string, TestMessage>({
  initialValue: "Initial",
  update(message) {
    return { value: message.action }
  },
})

const anotherTestContainer = container<number>({
  initialValue: 0
})

const readonlyContainer = supplied<number, string>({ initialValue: 17 })
