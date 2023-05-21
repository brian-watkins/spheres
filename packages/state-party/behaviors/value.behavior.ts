import { Container, Value, container, value } from "@src/index.js";
import { behavior, effect, example, fact, step } from "esbehavior";
import { equalTo, expect, is } from "great-expectations";
import { testStoreContext } from "helpers/testStore.js";

interface ValueWithReducerContext {
  dependency: Container<number>
  numberState: Value<number, "add" | "subtract">
}

export default behavior("value with reducer", [
  example(testStoreContext<ValueWithReducerContext>())
    .description("value that uses a reducer")
    .script({
      suppose: [
        fact("there is a value with a reducer", (context) => {
          const dependency = container({ initialValue: 7 })
          const numberState = value({
            query: (get) => {
              return get(dependency) % 2 === 1 ? "add" : "subtract"
            },
            reducer: (message, current?: number) => {
              if (current === undefined) {
                return 0
              }
              return message === "add" ? current + 1 : current - 1
            }
          })
          context.setTokens({
            dependency,
            numberState
          })
        }),
        fact("there is a subscriber to the number state", (context) => {
          context.subscribeTo(context.tokens.numberState, "sub-one")
        })
      ],
      perform: [
        step("the dependency is updated", (context) => {
          context.writeTo(context.tokens.dependency, 5)
        }),
        step("the dependency is updated", (context) => {
          context.writeTo(context.tokens.dependency, 5)
        }),
        step("the dependency is updated", (context) => {
          context.writeTo(context.tokens.dependency, 2)
        })
      ],
      observe: [
        effect("the subscriber gets the values", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            0,
            1,
            2,
            1
          ])))
        })
      ]
    })
])