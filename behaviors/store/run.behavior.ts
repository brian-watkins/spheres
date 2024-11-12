import { behavior, effect, example, fact, step } from "best-behavior";
import { testStoreContext } from "./helpers/testStore.js";
import { Container, container, run } from "@src/index.js";
import { equalTo, expect, is } from "great-expectations";

export default behavior("run", [

  example(testStoreContext<Container<string>>())
    .description("run a side effect")
    .script({
      suppose: [
        fact("there is a container", (context) => {
          context.setTokens(container({ initialValue: "hello" }))
        }),
        fact("there is a subscriber to the container", (context) => {
          context.subscribeTo(context.tokens, "sub-one")
        })
      ],
      perform: [
        step("a run message is dispatched to the store", (context) => {
          context.sendBatch([
            run(() => context.writeTo(context.tokens, "magic!"))
          ])
        })
      ],
      observe: [
        effect("the message is processed", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "hello",
            "magic!"
          ])))
        })
      ]
    })

])