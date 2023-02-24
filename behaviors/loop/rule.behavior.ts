import { Container, container, rule, trigger, withInitialValue } from "@src/index.js";
import { Rule } from "@src/loop.js";
import { behavior, effect, example, fact, step } from "esbehavior";
import { equalTo, expect, is } from "great-expectations";
import { testSubscriberContext } from "./helpers/testSubscriberContext.js";

interface BasicRuleContext {
  numberContainer: Container<number>,
  incrementModThreeRule: Rule<number, number>
}

const basicRule =
  example(testSubscriberContext<BasicRuleContext>())
    .description("trigger a rule")
    .script({
      suppose: [
        fact("there is a rule", (context) => {
          const numberContainer = container(withInitialValue(1))
          const incrementModThreeRule = rule(numberContainer, (get) => {
            return (get(numberContainer) + 1) % 3
          })
          context.setState({
            numberContainer,
            incrementModThreeRule
          })
        }),
        fact("there is a subscriber to the number container", (context) => {
          context.subscribeTo(context.state.numberContainer, "sub-one")
        })
      ],
      perform: [
        step("the rule is triggered", (context) => {
          context.update((loop) => {
            loop.dispatch(trigger(context.state.incrementModThreeRule))
          })
        }),
        step("the rule is triggered again", (context) => {
          context.update((loop) => {
            loop.dispatch(trigger(context.state.incrementModThreeRule))
          })
        }),
      ],
      observe: [
        effect("the subscriber gets the updated values", (context) => {
          expect(context.valuesReceivedBy("sub-one"), is(equalTo([
            1,
            2,
            0
          ])))
        })
      ]
    })

interface RuleWithInputContext {
  numberContainer: Container<number>
  incrementRule: Rule<number, number, number>
}

const ruleWithInput =
  example(testSubscriberContext<RuleWithInputContext>())
    .description('a rule that takes an input value')
    .script({
      suppose: [
        fact("there is a rule", (context) => {
          const numberContainer = container(withInitialValue(1))
          const incrementRule: Rule<number, number, number> = rule(numberContainer, (get, value) => {
            return get(numberContainer) + value
          })
          context.setState({
            numberContainer,
            incrementRule
          })
        }),
        fact("there is a subscriber to the number container", (context) => {
          context.subscribeTo(context.state.numberContainer, "sub-one")
        })
      ],
      perform: [
        step("the rule is triggered", (context) => {
          context.update((loop) => {
            loop.dispatch(trigger(context.state.incrementRule, 5))
          })
        }),
        step("the rule is triggered again", (context) => {
          context.update((loop) => {
            loop.dispatch(trigger(context.state.incrementRule, 10))
          })
        }),
      ],
      observe: [
        effect("the subscriber gets the updated values", (context) => {
          expect(context.valuesReceivedBy("sub-one"), is(equalTo([
            1,
            6,
            16
          ])))
        })
      ]
    })

export default behavior("rule", [
  basicRule,
  ruleWithInput
])