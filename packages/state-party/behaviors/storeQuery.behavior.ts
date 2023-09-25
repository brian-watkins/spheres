import { Container, container } from "@src/index.js"
import { ConfigurableExample, behavior, effect, example, fact, step } from "esbehavior"
import { equalTo, expect, is } from "great-expectations"
import { testStoreContext } from "helpers/testStore.js"

interface BasicQueryContext {
  stringContainer: Container<string>
  numberContainer: Container<number>
}

const basicQuery: ConfigurableExample =
  example(testStoreContext<BasicQueryContext>())
    .description("subscribe to a query")
    .script({
      suppose: [
        fact("there are some containers", (context) => {
          context.setTokens({
            stringContainer: container({ initialValue: "hello" }),
            numberContainer: container({ initialValue: 7 })
          })
        }),
        fact("a subscriber registers a query involving the state", (context) => {
          context.queryStore((get) => {
            return `${get(context.tokens.stringContainer)} ==> ${get(context.tokens.numberContainer)} times!`
          }, "sub-one")
        })
      ],
      observe: [
        effect("the subscriber gets the initial value of the query", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "hello ==> 7 times!"
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the string container is updated", (context) => {
          context.writeTo(context.tokens.stringContainer, "Yo!")
        }),
        step("the number container is updated", (context) => {
          context.writeTo(context.tokens.numberContainer, 14)
        })
      ],
      observe: [
        effect("the subscriber gets the updated value on each change", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "hello ==> 7 times!",
            "Yo! ==> 7 times!",
            "Yo! ==> 14 times!"
          ])))
        })
      ]
    })

const queryWithHiddenDependencies: ConfigurableExample =
  example(testStoreContext<BasicQueryContext>())
    .description("query with hidden dependents")
    .script({
      suppose: [
        fact("there are some containers", (context) => {
          context.setTokens({
            stringContainer: container({ initialValue: "hello" }),
            numberContainer: container({ initialValue: 7 })
          })
        }),
        fact("a subscriber registers a query involving the state", (context) => {
          context.queryStore((get) => {
            if (get(context.tokens.stringContainer) === "reveal!") {
              return `The secret number is: ${get(context.tokens.numberContainer)}`
            } else {
              return `It's a secret!`
            }
          }, "sub-one")
        })
      ],
      perform: [
        step("update the hidden dependency", (context) => {
          context.writeTo(context.tokens.numberContainer, 21)
        })
      ],
      observe: [
        effect("the subscriber does not update when the hidden dependency changes", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "It's a secret!",
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the hidden dependency is triggered", (context) => {
          context.writeTo(context.tokens.stringContainer, "reveal!")
        }),
        step("the hidden dependency is updated", (context) => {
          context.writeTo(context.tokens.numberContainer, 22)
        })
      ],
      observe: [
        effect("the subscriber gets updates for the hidden dependency now", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "It's a secret!",
            "The secret number is: 21",
            "The secret number is: 22",
          ])))
        })
      ]
    })

export default behavior("store query", [
  basicQuery,
  queryWithHiddenDependencies,
])
