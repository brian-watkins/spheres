import { container, write } from "@src/index";
import { behavior, effect, example, step } from "best-behavior";
import { arrayWith, expect, is } from "great-expectations";
import { errorMessage, pendingMessage } from "helpers/metaMatchers";
import { testStoreContext } from "helpers/testStore";

export default behavior("initialize state", [

  example(testStoreContext())
    .description("set initial values for tokens")
    .script({
      perform: [
        step("initialize the store", async (context) => {
          await context.store.initialize(testContainer, (actions) => {
            return new Promise<void>(resolve => setTimeout(() => {
              actions.supply("Fun Stuff!")
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
          context.store.initialize(anotherTestContainer, (actions) => {
            const length = actions.get(testContainer).length
            actions.supply(length)
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
          await context.store.initialize(testContainer, async (actions) => {
            actions.pending({ action: "Loading!" })
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
          await context.store.initialize(testContainer, async (actions) => {
            actions.error({ action: "Loading!" }, "No reason!")
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
