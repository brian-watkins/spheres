import { ConfigurableExample, behavior, effect, example, fact, step } from "esbehavior";
import { equalTo, expect, is } from "great-expectations";
import { Rule, Container, container, write, rule } from "@src/index.js";
import { testStoreContext } from "./helpers/testStore.js";

interface BasicRuleContext {
  numberContainer: Container<number>,
  incrementModThreeRule: Rule
}

const basicRule: ConfigurableExample =
  example(testStoreContext<BasicRuleContext>())
    .description("trigger a rule")
    .script({
      suppose: [
        fact("there is a rule", (context) => {
          const numberContainer = container({ initialValue: 1 })
          const incrementModThreeRule = rule((get) => {
            return write(numberContainer, (get(numberContainer) + 1) % 3)
          })
          context.setTokens({
            numberContainer,
            incrementModThreeRule
          })
        }),
        fact("there is a subscriber to the number container", (context) => {
          context.subscribeTo(context.tokens.numberContainer, "sub-one")
        })
      ],
      perform: [
        step("the rule is triggered", (context) => {
          context.useRule(context.tokens.incrementModThreeRule)
        }),
        step("the rule is triggered again", (context) => {
          context.useRule(context.tokens.incrementModThreeRule)
        }),
      ],
      observe: [
        effect("the subscriber gets the updated values", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            1,
            2,
            0
          ])))
        })
      ]
    })

const lateSubscribeRule: ConfigurableExample =
  example(testStoreContext<BasicRuleContext>())
    .description("dispatch a rule on a container before any subscribers")
    .script({
      suppose: [
        fact("there is a rule", (context) => {
          const numberContainer = container({ initialValue: 1 })
          const incrementModThreeRule = rule((get) => {
            return write(numberContainer, (get(numberContainer) + 1) % 3)
          })
          context.setTokens({
            numberContainer,
            incrementModThreeRule
          })
        })
      ],
      perform: [
        step("the rule is triggered", (context) => {
          context.useRule(context.tokens.incrementModThreeRule)
        }),
        step("the rule is triggered again", (context) => {
          context.useRule(context.tokens.incrementModThreeRule)
        }),
        step("a listener subscribes to the container", (context) => {
          context.subscribeTo(context.tokens.numberContainer, "sub-one")
        })
      ],
      observe: [
        effect("the subscriber gets the latest value", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            0
          ])))
        })
      ]
    })

interface RuleWithInputContext {
  numberContainer: Container<number>
  incrementRule: Rule<number>
}

const ruleWithInput: ConfigurableExample =
  example(testStoreContext<RuleWithInputContext>())
    .description("a rule that takes an input value")
    .script({
      suppose: [
        fact("there is a rule", (context) => {
          const numberContainer = container({ initialValue: 1 })
          const incrementRule = rule((get, value: number) => {
            return write(numberContainer, get(numberContainer) + value)
          })
          context.setTokens({
            numberContainer,
            incrementRule
          })
        }),
        fact("there is a subscriber to the number container", (context) => {
          context.subscribeTo(context.tokens.numberContainer, "sub-one")
        })
      ],
      perform: [
        step("the rule is triggered", (context) => {
          context.useRule(context.tokens.incrementRule, 5)
        }),
        step("the rule is triggered again", (context) => {
          context.useRule(context.tokens.incrementRule, 10)
        }),
      ],
      observe: [
        effect("the subscriber gets the updated values", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            1,
            6,
            16
          ])))
        })
      ]
    })

interface RuleWithOtherStateContext {
  numberContainer: Container<number>
  anotherContainer: Container<number>
  incrementRule: Rule<number>
}

const ruleWithOtherState: ConfigurableExample =
  example(testStoreContext<RuleWithOtherStateContext>())
    .description("a rule that gets the value of another state")
    .script({
      suppose: [
        fact("there is a rule", (context) => {
          const numberContainer = container({ initialValue: 1 })
          const anotherContainer = container({ initialValue: 7 })
          const incrementRule = rule((get, value: number) => {
            return write(numberContainer, get(anotherContainer) + get(numberContainer) + value)
          })
          context.setTokens({
            numberContainer,
            anotherContainer,
            incrementRule
          })
        }),
        fact("there is a subscriber to the number container", (context) => {
          context.subscribeTo(context.tokens.numberContainer, "sub-one")
        })
      ],
      perform: [
        step("the rule is triggered", (context) => {
          context.useRule(context.tokens.incrementRule, 5)
        }),
        step("the other container is updated", (context) => {
          context.writeTo(context.tokens.anotherContainer, 3)
        }),
        step("the rule is triggered again", (context) => {
          context.useRule(context.tokens.incrementRule, 10)
        }),
      ],
      observe: [
        effect("the subscriber gets the updated values", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            1,
            13,
            26
          ])))
        })
      ]
    })


export default behavior("rule", [
  basicRule,
  lateSubscribeRule,
  ruleWithInput,
  ruleWithOtherState
])