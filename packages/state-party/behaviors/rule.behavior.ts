import { Command, Container, command, container, withInitialValue, withReducer } from "@src/index.js";
import { ConfigurableExample, behavior, effect, example, fact, step } from "esbehavior";
import { equalTo, expect, is } from "great-expectations";
import { testStoreContext } from "helpers/testStore.js";

interface BasicRuleContext {
  numberContainer: Container<number>
  stringContainer: Container<string>
}

const basicRule: ConfigurableExample =
  example(testStoreContext<BasicRuleContext>())
    .description("trigger a rule")
    .script({
      suppose: [
        fact("there is a container with a rule", (context) => {
          const numberContainer = container(withInitialValue(7))
          const stringContainer = container(withInitialValue("hello").withRule(({get, current}, next) => {
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
        effect("the subscriber gets the value updated after the rule is triggered", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "hello",
            "even"
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("attempt to write a value that conflicts with the rule", (context) => {
          context.writeTo(context.tokens.stringContainer, "something else!")
        })
      ],
      observe: [
        effect("the subscriber gets the value that conforms to the rule", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "hello",
            "even",
            "even"
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("write a value that conforms to the rule", (context) => {
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

interface RuleDependencyContext {
  stringContainer: Container<string>
  anotherStringContainer: Container<string>
  ruleContainer: Container<string>
}

const ruleDependency: ConfigurableExample =
  example(testStoreContext<RuleDependencyContext>())
    .description("the rule has a dependency that is not used initially")
    .script({
      suppose: [
        fact("there is a container with a rule", (context) => {
          const stringContainer = container(withInitialValue("hello"))
          const anotherStringContainer = container(withInitialValue("fun"))
          const ruleContainer = container(withInitialValue("first").withRule(({get, current}, next) => {
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
            ruleContainer
          })
        }),
        fact("there is a subscriber to the rule container", (context) => {
          context.subscribeTo(context.tokens.ruleContainer, "sub-one")
        })
      ],
      perform: [
        step("the other string container is updated", (context) => {
          context.writeTo(context.tokens.anotherStringContainer, "awesome")
        }),
        step("the rule container is written to", (context) => {
          context.writeTo(context.tokens.ruleContainer, "second")
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

interface RuleCommandContext {
  stringContainer: Container<string>,
  numberContainer: Container<number>,
  incrementModThreeCommand: Command<number, number>
}

const ruleFromCommand: ConfigurableExample =
  example(testStoreContext<RuleCommandContext>())
    .description("a command provides the value to a rule")
    .script({
      suppose: [
        fact("there is a command for a container with a rule", (context) => {
          const stringContainer = container(withInitialValue("init"))
          const numberContainer = container(withInitialValue(1).withRule(({get, current}, next) => {
            return get(stringContainer).length + (next ?? current)
          }))
          const incrementModThreeCommand = command(numberContainer, ({ current }) => {
            return (current + 1) % 3
          })
          context.setTokens({
            stringContainer,
            numberContainer,
            incrementModThreeCommand
          })
        }),
        fact("there is a subscriber to the container", (context) => {
          context.subscribeTo(context.tokens.numberContainer, "sub-one")
        })
      ],
      perform: [
        step("the command is dispatched", (context) => {
          context.dispatchCommand(context.tokens.incrementModThreeCommand)
        }),
        step("the dependency is updated", (context) => {
          context.writeTo(context.tokens.stringContainer, "hello")
        }),
        step("the command is dispatched again", (context) => {
          context.dispatchCommand(context.tokens.incrementModThreeCommand)
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

interface ReducerRuleContext {
  numberContainer: Container<number>
  ruleContainer: Container<number, string>
}

const ruleWithReducer: ConfigurableExample =
  example(testStoreContext<ReducerRuleContext>())
    .description("rule with a reducer")
    .script({
      suppose: [
        fact("there is a container with a reducer and a rule", (context) => {
          const numberContainer = container(withInitialValue(17))
          const ruleContainer = container(withReducer(7, (message: string, current) => {
            if (message === "add") {
              return current + 1
            } else {
              return current - 1
            }
          }).withRule(({get}, next) => {
            if (next) return next
            return (get(numberContainer) % 2 === 0) ? "add" : "not-add"
          }))
          context.setTokens({
            numberContainer,
            ruleContainer
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.tokens.ruleContainer, "sub-one")
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
          context.writeTo(context.tokens.ruleContainer, "add")
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

export default behavior("rule", [
  basicRule,
  ruleFromCommand,
  ruleDependency,
  ruleWithReducer
])