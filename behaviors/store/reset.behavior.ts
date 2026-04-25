import { Container, container, derived, DerivedState } from "@store/index.js";
import { behavior, effect, example, fact, step } from "best-behavior";
import { equalTo, expect, is } from "great-expectations";
import { testStoreContext } from "./helpers/testStore";

export default behavior("reset container", [

  example(testStoreContext<Container<string>>())
    .description("reset container to initial static value")
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

  example(testStoreContext<DerivedInitialValueContext>())
    .description("reset container to initial derived value")
    .script({
      suppose: [
        fact("there is a container with a derived initial value", (context) => {
          context.setTokens({
            stringState: container({
              initialValue: (get) => {
                return `Begin with: ${get(context.tokens.previousState)} ${get(context.tokens.derivedState)}`
              }
            }),
            previousState: container({
              initialValue: "INITIAL"
            }),
            derivedState: derived(get => `[${get(context.tokens.previousState).length} characters]`)
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.tokens.stringState, "sub-one")
        })
      ],
      perform: [
        step("a value is written to the container", (context) => {
          context.writeTo(context.tokens.stringState, "one")
        }),
        step("the state dependency is updated", (context) => {
          context.writeTo(context.tokens.previousState, "SECONDARY")
        }),
        step("another value is written to the container", (context) => {
          context.writeTo(context.tokens.stringState, "two")
        }),
        step("a reset message is sent to the store", (context) => {
          context.sendReset(context.tokens.stringState)
        })
      ],
      observe: [
        effect("upon reset the subscriber receives the latest query value", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "Begin with: INITIAL [7 characters]",
            "one",
            "two",
            "Begin with: SECONDARY [9 characters]"
          ])))
        })
      ]
    }),

  example(testStoreContext<Container<number, string>>())
    .description("reset message-based container with static initial value")
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

interface DerivedInitialValueContext {
  stringState: Container<string>
  previousState: Container<string>
  derivedState: DerivedState<string>
}