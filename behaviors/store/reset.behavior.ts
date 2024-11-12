import { Container, container } from "@src/index";
import { behavior, effect, example, fact, step } from "best-behavior";
import { equalTo, expect, is } from "great-expectations";
import { testStoreContext } from "helpers/testStore";

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
    })

])