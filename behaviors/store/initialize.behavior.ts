import { container, supplied, write } from "@store/index.js";
import { behavior, effect, example, step } from "best-behavior";
import { arrayWith, expect, is } from "great-expectations";
import { errorMessage, okMessage, pendingMessage } from "./helpers/metaMatchers";
import { testStoreContext } from "./helpers/testStore";
import { TestTask } from "./helpers/testTask";

export default behavior("initialize state", [

  example(testStoreContext())
    .description("await on initialized with no initializer")
    .script({
      perform: [
        step("await on initialized", async (context) => {
          await context.store.initialized
        }),
        step("subscribe to a token", context => {
          context.subscribeTo(readonlyContainer, "sub-1")
        })
      ],
      observe: [
        effect("the subscriber gets the default value", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            17
          ]))
        })
      ]
    }),

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
    }),

  example(testStoreContext())
    .description("initializer that references existing state")
    .script({
      perform: [
        step("use existing state in initialization", async (context) => {
          await context.initialize(async (actions) => {
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
            7
          ]))
        })
      ]
    }),

  example(testStoreContext())
    .description("set pending values for container upon initialization")
    .script({
      perform: [
        step("initialize meta container values", async (context) => {
          await context.initialize(async (actions) => {
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
        step("initialize readonly container pending state", async (context) => {
          await context.initialize(async (actions) => {
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
    }),

  example(testStoreContext<TestTask<number>>())
    .description("send multiple updates in initializer")
    .script({
      perform: [
        step("initialize with several values", async (context) => {
          context.setTokens(new TestTask())
          context.initialize(async (actions) => {
            actions.pending(readonlyContainer)

            const data = await context.tokens.waitForIt()
            actions.supply(readonlyContainer, data)
          })
        }),
        step("subscribe to the container", (context) => {
          context.subscribeTo(readonlyContainer, "sub-1")
        }),
        step("subscribe to the meta-container", context => {
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
            pendingMessage(undefined),
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("a value is supplied", (context) => {
          context.tokens.resolveWith(37)
        })
      ],
      observe: [
        effect("the subscriber receives the supplied value", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            17,
            37
          ]))
        }),
        effect("the meta subscriber receives the ok message", (context) => {
          expect(context.valuesForSubscriber("sub-meta"), is(arrayWith([
            pendingMessage(undefined),
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
