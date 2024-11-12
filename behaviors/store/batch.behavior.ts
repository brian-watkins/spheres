import { container, write } from "@src/index.js";
import { Container } from "@src/store.js";
import { behavior, effect, example, fact, step } from "best-behavior";
import { equalTo, expect, is } from "great-expectations";
import { testStoreContext } from "helpers/testStore.js";

interface SimpleBatchContext {
  numberContainer: Container<number>
  stringContainer: Container<string>
  reducerContainer: Container<Array<number>, string>
}

export default behavior("batched store messages", [
  example(testStoreContext<SimpleBatchContext>())
    .description("batched write messages to multiple containers")
    .script({
      suppose: [
        fact("there is a container", (context) => {
          context.setTokens({
            numberContainer: container({ initialValue: 0 }),
            stringContainer: container({ initialValue: "hello" }),
            reducerContainer: container({
              initialValue: [0], update: (message, current) => {
                return { value: [...current, message.length] }
              }
            })
          })
        }),
        fact("there are subscribers to all the containers", (context) => {
          context.subscribeTo(context.tokens.numberContainer, "sub-one")
          context.subscribeTo(context.tokens.stringContainer, "sub-two")
          context.subscribeTo(context.tokens.reducerContainer, "sub-three")
        })
      ],
      perform: [
        step("a batch message is sent updating all three containers", (context) => {
          context.sendBatch([
            write(context.tokens.numberContainer, 4),
            write(context.tokens.stringContainer, "Yo!"),
            write(context.tokens.reducerContainer, "long word")
          ])
        })
      ],
      observe: [
        effect("the number container is updated", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            0,
            4
          ])))
        }),
        effect("the string container is updated", (context) => {
          expect(context.valuesForSubscriber("sub-two"), is(equalTo([
            "hello",
            "Yo!"
          ])))
        }),
        effect("the reducer container is updated", (context) => {
          expect(context.valuesForSubscriber("sub-three"), is(equalTo([
            [0],
            [0, 9]
          ])))
        })
      ]
    })
])
