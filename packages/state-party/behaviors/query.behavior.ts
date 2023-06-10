import { Selection, Container, selection, container, write } from "@src/index.js";
import { ConfigurableExample, behavior, effect, example, fact, step } from "esbehavior";
import { equalTo, expect, is } from "great-expectations";
import { testStoreContext } from "helpers/testStore.js";

interface BasicQueryContext {
  numberContainer: Container<number>
  stringContainer: Container<string>
}

const basicQuery: ConfigurableExample =
  example(testStoreContext<BasicQueryContext>())
    .description("trigger a query")
    .script({
      suppose: [
        fact("there is a container with a query", (context) => {
          const numberContainer = container({ initialValue: 7 })
          const stringContainer = container({
            initialValue: "hello",
            query: ({get, current}, next) => {
              if (get(numberContainer) % 2 === 0) {
                return "even"
              } else {
                return next ?? current
              }
            }
          })
          context.setTokens({
            numberContainer,
            stringContainer
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.tokens.stringContainer, "sub-one")
        })
      ],
      observe: [
        effect("the subscriber gets the initial value", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "hello"
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the dependency is updated", (context) => {
          context.writeTo(context.tokens.numberContainer, 4)
        })
      ],
      observe: [
        effect("the subscriber gets the value updated after the query is triggered", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "hello",
            "even"
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("write a value to trigger the query, which just results in the same value", (context) => {
          context.writeTo(context.tokens.stringContainer, "something else!")
        })
      ],
      observe: [
        effect("the subscriber does not receive a new message", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "hello",
            "even",
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("write another value that triggers the query", (context) => {
          context.writeTo(context.tokens.numberContainer, 27)
          context.writeTo(context.tokens.stringContainer, "this is odd!")
        })
      ],
      observe: [
        effect("the subscriber gets the value", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "hello",
            "even",
            "this is odd!"
          ])))
        })
      ]
    })

interface QueryDependencyContext {
  stringContainer: Container<string>
  anotherStringContainer: Container<string>
  queryContainer: Container<string>
}

const queryDependency: ConfigurableExample =
  example(testStoreContext<QueryDependencyContext>())
    .description("the query has a dependency that is not used initially")
    .script({
      suppose: [
        fact("there is a container with a query", (context) => {
          const stringContainer = container({ initialValue: "hello" })
          const anotherStringContainer = container({ initialValue: "fun" })
          const queryContainer = container({
            initialValue: "first",
            query: ({get, current}, next) => {
              const word = next ?? current
              if (get(stringContainer) === "hello") {
                return `${word} stuff`
              } else {
                return `${word} ${get(anotherStringContainer)} things!`
              }
            }
          })
          context.setTokens({
            stringContainer,
            anotherStringContainer,
            queryContainer
          })
        }),
        fact("there is a subscriber to the query container", (context) => {
          context.subscribeTo(context.tokens.queryContainer, "sub-one")
        })
      ],
      perform: [
        step("the other string container is updated", (context) => {
          context.writeTo(context.tokens.anotherStringContainer, "awesome")
        }),
        step("the query container is written to", (context) => {
          context.writeTo(context.tokens.queryContainer, "second")
        }),
        step("the string container is updated", (context) => {
          context.writeTo(context.tokens.stringContainer, "something else")
        }),
        step("the other string container is updated", (context) => {
          context.writeTo(context.tokens.anotherStringContainer, "cool")
        })
      ],
      observe: [
        effect("the subscriber receives all the values", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "first stuff",
            "second stuff",
            "second stuff awesome things!",
            "second stuff awesome things! cool things!"
          ])))
        })
      ]
    })

interface QuerySelectionContext {
  stringContainer: Container<string>,
  numberContainer: Container<number>,
  incrementModThreeSelection: Selection
}

const queryFromSelection: ConfigurableExample =
  example(testStoreContext<QuerySelectionContext>())
    .description("a selection provides the value to a query")
    .script({
      suppose: [
        fact("there is a selection for a container with a query", (context) => {
          const stringContainer = container({ initialValue: "init" })
          const numberContainer = container({
            initialValue: 1,
            query: ({get, current}, next) => {
              return get(stringContainer).length + (next ?? current)
            }
          })
          const incrementModThreeSelection = selection((get) => {
            return write(numberContainer, (get(numberContainer) + 1) % 3)
          })
          context.setTokens({
            stringContainer,
            numberContainer,
            incrementModThreeSelection
          })
        }),
        fact("there is a subscriber to the container", (context) => {
          context.subscribeTo(context.tokens.numberContainer, "sub-one")
        })
      ],
      perform: [
        step("the selection is stored", (context) => {
          context.storeSelection(context.tokens.incrementModThreeSelection)
        }),
        step("the dependency is updated", (context) => {
          context.writeTo(context.tokens.stringContainer, "hello")
        }),
        step("the selection is stored again", (context) => {
          context.storeSelection(context.tokens.incrementModThreeSelection)
        })
      ],
      observe: [
        effect("the subscriber receives all the updates", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            5,
            4,
            9,
            6
          ])))
        })
      ]
    })

interface ReducerQueryContext {
  numberContainer: Container<number>
  queryContainer: Container<number, string>
}

const queryWithReducer: ConfigurableExample =
  example(testStoreContext<ReducerQueryContext>())
    .description("query with a reducer")
    .script({
      suppose: [
        fact("there is a container with a reducer and a query", (context) => {
          const numberContainer = container({ initialValue: 17 })
          const queryContainer: Container<number, string> = container({
            initialValue: 7,
            query: ({get}, next) => {
              if (next) return next
              return (get(numberContainer) % 2 === 0) ? "add" : "not-add"
            },
            reducer: (message, current) => {
              if (message === "add") {
                return current + 1
              } else {
                return current - 1
              }
            },
          })
          context.setTokens({
            numberContainer,
            queryContainer
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.tokens.queryContainer, "sub-one")
        })
      ],
      perform: [
        step("the number container is updated", (context) => {
          context.writeTo(context.tokens.numberContainer, 14)
        }),
        step("the number container is updated", (context) => {
          context.writeTo(context.tokens.numberContainer, 3)
        }),
        step("a message is sent to the container", (context) => {
          context.writeTo(context.tokens.queryContainer, "add")
        })
      ],
      observe: [
        effect("the subscriber receives the values", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            6,
            7,
            6,
            7
          ])))
        })
      ]
    })

export default behavior("query", [
  basicQuery,
  queryFromSelection,
  queryDependency,
  queryWithReducer
])