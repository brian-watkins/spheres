import { behavior, effect, example, fact, step } from "esbehavior";
import { equalTo, expect, is } from "great-expectations";
import { Container, container, withReducer } from "@src/index.js";
import { testStoreContext } from "./helpers/testStore.js";

interface UpdateContainerContext {
  fancyContainer: Container<string, FancyMessage>
}

interface FancyInsert {
  type: "insert"
  value: string
}

interface FancyReset {
  type: "reset"
}

type FancyMessage = FancyInsert | FancyReset

export default behavior("update container", [
  example(testStoreContext<UpdateContainerContext>())
    .description("custom update function")
    .script({
      suppose: [
        fact("there is a container with a custom update function", (context) => {
          const fancyContainer = container(withReducer("hello", (message: FancyMessage, current) => {
            switch (message.type) {
              case "insert":
                return `${current} ${message.value}`
              case "reset":
                return "reset!"
            }
          }))

          context.setTokens({
            fancyContainer
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.tokens.fancyContainer, "sub-one")
        })
      ],
      perform: [
        step("a custom message is sent to the container", (context) => {
          context.writeTo(context.tokens.fancyContainer, {
            type: "insert",
            value: "stuff!"
          })
        }),
        step("another custom message is sent to the container", (context) => {
          context.writeTo(context.tokens.fancyContainer, {
            type: "reset"
          })
        })
      ],
      observe: [
        effect("the subscriber receives the messages", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "hello",
            "hello stuff!",
            "reset!"
          ])))
        })
      ]
    })
])