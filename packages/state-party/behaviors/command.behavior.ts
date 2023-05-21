import { ConfigurableExample, behavior, effect, example, fact, step } from "esbehavior";
import { equalTo, expect, is } from "great-expectations";
import { Command, Container, command, container } from "@src/index.js";
import { testStoreContext } from "./helpers/testStore.js";

interface BasicCommandContext {
  numberContainer: Container<number>,
  incrementModThreeCommand: Command<number, number>
}

const basicCommand: ConfigurableExample =
  example(testStoreContext<BasicCommandContext>())
    .description("trigger a command")
    .script({
      suppose: [
        fact("there is a command", (context) => {
          const numberContainer = container({ initialValue: 1 })
          const incrementModThreeRule = command(numberContainer, ({ current }) => {
            return (current + 1) % 3
          })
          context.setTokens({
            numberContainer,
            incrementModThreeCommand: incrementModThreeRule
          })
        }),
        fact("there is a subscriber to the number container", (context) => {
          context.subscribeTo(context.tokens.numberContainer, "sub-one")
        })
      ],
      perform: [
        step("the command is dispatched", (context) => {
          context.dispatchCommand(context.tokens.incrementModThreeCommand)
        }),
        step("the command is dispatched again", (context) => {
          context.dispatchCommand(context.tokens.incrementModThreeCommand)
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

const lateSubscribeCommand: ConfigurableExample =
  example(testStoreContext<BasicCommandContext>())
    .description("dispatch a command on a container before any subscribers")
    .script({
      suppose: [
        fact("there is a command", (context) => {
          const numberContainer = container({ initialValue: 1 })
          const incrementModThreeRule = command(numberContainer, ({ current }) => {
            return (current + 1) % 3
          })
          context.setTokens({
            numberContainer,
            incrementModThreeCommand: incrementModThreeRule
          })
        })
      ],
      perform: [
        step("the command is dispatched", (context) => {
          context.dispatchCommand(context.tokens.incrementModThreeCommand)
        }),
        step("the command is dispatched again", (context) => {
          context.dispatchCommand(context.tokens.incrementModThreeCommand)
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

interface CommandWithInputContext {
  numberContainer: Container<number>
  incrementCommand: Command<number, number, number>
}

const commandWithInput: ConfigurableExample =
  example(testStoreContext<CommandWithInputContext>())
    .description("a command that takes an input value")
    .script({
      suppose: [
        fact("there is a command", (context) => {
          const numberContainer = container({ initialValue: 1 })
          const incrementCommand = command(numberContainer, ({ current }, value: number) => {
            return current + value
          })
          context.setTokens({
            numberContainer,
            incrementCommand
          })
        }),
        fact("there is a subscriber to the number container", (context) => {
          context.subscribeTo(context.tokens.numberContainer, "sub-one")
        })
      ],
      perform: [
        step("the command is dispatched", (context) => {
          context.dispatchCommand(context.tokens.incrementCommand, 5)
        }),
        step("the command is dispatched again", (context) => {
          context.dispatchCommand(context.tokens.incrementCommand, 10)
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

interface CommandWithOtherStateContext {
  numberContainer: Container<number>
  anotherContainer: Container<number>
  incrementCommand: Command<number, number, number>
}

const commandWithOtherState: ConfigurableExample =
  example(testStoreContext<CommandWithOtherStateContext>())
    .description("a command that gets the value of another state")
    .script({
      suppose: [
        fact("there is a command", (context) => {
          const numberContainer = container({ initialValue: 1 })
          const anotherContainer = container({ initialValue: 7 })
          const incrementCommand = command(numberContainer, ({ get, current }, value: number) => {
            return get(anotherContainer) + current + value
          })
          context.setTokens({
            numberContainer,
            anotherContainer,
            incrementCommand
          })
        }),
        fact("there is a subscriber to the number container", (context) => {
          context.subscribeTo(context.tokens.numberContainer, "sub-one")
        })
      ],
      perform: [
        step("the command is dispatched", (context) => {
          context.dispatchCommand(context.tokens.incrementCommand, 5)
        }),
        step("the other container is updated", (context) => {
          context.writeTo(context.tokens.anotherContainer, 3)
        }),
        step("the command is dispatched again", (context) => {
          context.dispatchCommand(context.tokens.incrementCommand, 10)
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


export default behavior("command", [
  basicCommand,
  lateSubscribeCommand,
  commandWithInput,
  commandWithOtherState
])