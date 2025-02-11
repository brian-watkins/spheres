import { behavior, effect, example, fact, step } from "best-behavior";
import { equalTo, expect, is } from "great-expectations";
import { Container, container, write } from "@src/index.js";
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
    .description("update function that produces a value")
    .script({
      suppose: [
        fact("there is a container with an update function", (context) => {
          const fancyContainer = container<string, FancyMessage>({
            initialValue: "hello",
            update: (message, current) => {
              switch (message.type) {
                case "insert":
                  return { value: `${current} ${message.value}` }
                case "reset":
                  return { value: "reset!" }
              }
            }
          })

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
    }),

  example(testStoreContext<UpdateWithMessageContext>())
    .description("update function that produces a value and message")
    .script({
      suppose: [
        fact("there is a container with an update function", (context) => {
          const otherContainer = container({ initialValue: "" })

          context.setTokens({
            updatableContainer: container({
              initialValue: 0,
              update(message: string, current) {
                switch (message) {
                  case "add":
                    return {
                      value: current + 1,
                      message: write(otherContainer, `Added 1 to ${current}`)
                    }
                  default:
                    return {
                      value: current,
                      message: write(otherContainer, `Did nothing to ${current}`)
                    }
                }
              }
            }),
            otherContainer
          })
        }),
        fact("there is a subscriber to the updateable container", (context) => {
          context.subscribeTo(context.tokens.updatableContainer, "sub")
        }),
        fact("there is a subscriber to the other container", (context) => {
          context.subscribeTo(context.tokens.otherContainer, "other-sub")
        })
      ],
      perform: [
        step("send add message to the updateable container", (context) => {
          context.writeTo(context.tokens.updatableContainer, "add")
        }),
        step("send add message to the updateable container", (context) => {
          context.writeTo(context.tokens.updatableContainer, "add")
        }),
        step("send add message to the updateable container", (context) => {
          context.writeTo(context.tokens.updatableContainer, "add")
        }),
        step("send some other message to the updateable container", (context) => {
          context.writeTo(context.tokens.updatableContainer, "something-else")
        })
      ],
      observe: [
        effect("the updateable container subscriber received the expected values", (context) => {
          expect(context.valuesForSubscriber("sub"), is([
            0,
            1,
            2,
            3
          ]))
        }),
        effect("the other container received messages sent by the updateable container", (context) => {
          expect(context.valuesForSubscriber("other-sub"), is([
            "",
            "Added 1 to 0",
            "Added 1 to 1",
            "Added 1 to 2",
            "Did nothing to 3"
          ]))
        })
      ]
    })

])

interface UpdateWithMessageContext {
  updatableContainer: Container<number, string>
  otherContainer: Container<string>
}