import { Container, container } from "@store/index.js";
import { behavior, effect, example, fact, step } from "best-behavior";
import { equalTo, expect, is } from "great-expectations";
import { testStoreContext } from "./helpers/testStore";

export default behavior("reset container", [

  example(testStoreContext<Container<string>>())
    .description("reset container to initial value")
    .script({
      suppose: [
        fact("there is a container", (context) => {
          context.setTokens(container({ initialValue: "initial!" }))
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.tokens, "sub-one")
        })
      ],
      perform: [
        step("a value is written to the container", (context) => {
          context.writeTo(context.tokens, "one")
        }),
        step("another value is written to the container", (context) => {
          context.writeTo(context.tokens, "two")
        }),
        step("a reset message is sent to the store", (context) => {
          context.sendReset(context.tokens)
        })
      ],
      observe: [
        effect("the subscriber receives the original value", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "initial!",
            "one",
            "two",
            "initial!"
          ])))
        })
      ]
    }),

  example(testStoreContext<Container<number, string>>())
    .description("reset container that uses messages")
    .script({
      suppose: [
        fact("there is a container", (context) => {
          context.setTokens(container({
            initialValue: 0,
            update(message, current) {
              if (message === "increment") {
                return { value: current + 1 }
              } else {
                return { value: current - 1 }
              }
            },
          }))
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.tokens, "sub-one")
        })
      ],
      perform: [
        step("a message is written to the container", (context) => {
          context.writeTo(context.tokens, "increment")
        }),
        step("another message is written to the container", (context) => {
          context.writeTo(context.tokens, "increment")
        }),
        step("a reset message is sent to the store", (context) => {
          context.sendReset(context.tokens)
        })
      ],
      observe: [
        effect("the subscriber receives the initial state when the reset message is sent", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is([
            0,
            1,
            2,
            0
          ]))
        })
      ]
    })

])