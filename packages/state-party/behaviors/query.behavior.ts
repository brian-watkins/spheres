import { Container, Rule, container, rule, withInitialValue, withReducer } from "@src/index.js";
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
          const numberContainer = container(withInitialValue(7))
          const stringContainer = container(withInitialValue("hello").withQuery(({get, current}, next) => {
            if (get(numberContainer) % 2 === 0) {
              return "even"
            } else {
              return next ?? current
            }
          }))
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
        step("attempt to write a value that conflicts with the query", (context) => {
          context.writeTo(context.tokens.stringContainer, "something else!")
        })
      ],
      observe: [
        effect("the subscriber gets the value that conforms to the query", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "hello",
            "even",
            "even"
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("write a value that conforms to the query", (context) => {
          context.writeTo(context.tokens.numberContainer, 27)
          context.writeTo(context.tokens.stringContainer, "this is odd!")
        })
      ],
      observe: [
        effect("the subscriber gets the value", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "hello",
            "even",
            "even",
            "even", // note that this is the change in dependency triggering a write
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
          const stringContainer = container(withInitialValue("hello"))
          const anotherStringContainer = container(withInitialValue("fun"))
          const queryContainer = container(withInitialValue("first").withQuery(({get, current}, next) => {
            const word = next ?? current
            if (get(stringContainer) === "hello") {
              return `${word} stuff`
            } else {
              return `${word} ${get(anotherStringContainer)} things!`
            }
          }))
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

interface RuleQueryContext {
  stringContainer: Container<string>,
  numberContainer: Container<number>,
  incrementModThreeRule: Rule<number, number>
}

const queryFromRule: ConfigurableExample =
  example(testStoreContext<RuleQueryContext>())
    .description("a rule provides the value to a query")
    .script({
      suppose: [
        fact("there is a rule for a container with a query", (context) => {
          const stringContainer = container(withInitialValue("init"))
          const numberContainer = container(withInitialValue(1).withQuery(({get, current}, next) => {
            return get(stringContainer).length + (next ?? current)
          }))
          const incrementModThreeRule = rule(numberContainer, ({ current }) => {
            return (current + 1) % 3
          })
          context.setTokens({
            stringContainer,
            numberContainer,
            incrementModThreeRule
          })
        }),
        fact("there is a subscriber to the container", (context) => {
          context.subscribeTo(context.tokens.numberContainer, "sub-one")
        })
      ],
      perform: [
        step("the rule is triggered", (context) => {
          context.triggerRule(context.tokens.incrementModThreeRule)
        }),
        step("the dependency is updated", (context) => {
          context.writeTo(context.tokens.stringContainer, "hello")
        }),
        step("the rule is triggered again", (context) => {
          context.triggerRule(context.tokens.incrementModThreeRule)
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
          const numberContainer = container(withInitialValue(17))
          const queryContainer = container(withReducer(7, (message: string, current) => {
            if (message === "add") {
              return current + 1
            } else {
              return current - 1
            }
          }).withQuery(({get}, next) => {
            if (next) return next
            return (get(numberContainer) % 2 === 0) ? "add" : "not-add"
          }))
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
        step("a command is sent to the container", (context) => {
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
  queryFromRule,
  queryDependency,
  queryWithReducer
])