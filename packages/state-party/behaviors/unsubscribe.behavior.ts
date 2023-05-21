import { behavior, effect, example, fact, step } from "esbehavior";
import { equalTo, expect, is } from "great-expectations";
import { testStoreContext } from "./helpers/testStore.js";
import { Container, container } from "@src/index.js";

interface BasicUnsubscribeContext {
  numberContainer: Container<number>
}

export default behavior("unsubscribe from state", [
  example(testStoreContext<BasicUnsubscribeContext>())
    .description("a subscriber unsubscribes")
    .script({
      suppose: [
        fact("there is a container", (context) => {
          context.setTokens({
            numberContainer: container({ initialValue: 0 })
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.tokens.numberContainer, "sub-one")
        }),
        fact("there is another subscriber", (context) => {
          context.subscribeTo(context.tokens.numberContainer, "sub-two")
        })
      ],
      perform: [
        step("the first subscriber unsubscribes", (context) => {
          context.unsubscribe("sub-one")
        }),
        step("the container value is updated", (context) => {
          context.writeTo(context.tokens.numberContainer, 27)
        })
      ],
      observe: [
        effect("the first subscriber only ever received the initial value", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            0
          ])))
        }),
        effect("the second subscriber received the update", (context) => {
          expect(context.valuesForSubscriber("sub-two"), is(equalTo([
            0,
            27
          ])))
        })
      ]
    })
])
