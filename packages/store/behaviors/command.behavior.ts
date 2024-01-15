import { Command, SuppliedState, command, exec, supplied } from "@src/index";
import { behavior, effect, example, fact, step } from "esbehavior";
import { arrayWith, expect, is } from "great-expectations";
import { errorMessage, okMessage, pendingMessage } from "helpers/metaMatchers";
import { testStoreContext } from "helpers/testStore";

interface FunCommandMessage {
  name: string
  value: number
}

interface TestCommandContext {
  command: Command<FunCommandMessage>
  messages: Array<FunCommandMessage>
}

interface TestCommandStateContext {
  command: Command<{ container: SuppliedState<string, number, boolean> }>
  responseContainer: SuppliedState<string, number, boolean>
}

export default behavior("command", [

  example(testStoreContext<TestCommandContext>())
    .description("basic command")
    .script({
      suppose: [
        fact("there is a command registered with the store", (context) => {
          const funCommand = command<FunCommandMessage>()
          let messages: Array<FunCommandMessage> = []
          context.useCommand(funCommand, (message) => {
            messages.push(message)
          })
          context.setTokens({
            command: funCommand,
            messages
          })
        })
      ],
      perform: [
        step("the command is triggered with a message", (context) => {
          context.store.dispatch(exec(context.tokens.command, {
            name: "Fun stuff!",
            value: 27
          }))
        }),
        step("the command is triggered with another message", (context) => {
          context.store.dispatch(exec(context.tokens.command, {
            name: "Awesome stuff!",
            value: 31
          }))
        })
      ],
      observe: [
        effect("the command handler receives the messages", (context) => {
          expect(context.tokens.messages, is([
            { name: "Fun stuff!", value: 27 },
            { name: "Awesome stuff!", value: 31 },
          ]))
        })
      ]
    }),

  example(testStoreContext<TestCommandStateContext>())
    .description("writing to supplied state from the command handler")
    .script({
      suppose: [
        fact("there is a command that accepts supplied state to write to in its message", (context) => {
          const funCommand = command<{ container: SuppliedState<string, number, boolean> }>()
          context.setTokens({
            command: funCommand,
            responseContainer: supplied<string, number, boolean>({ initialValue: "initial value" })
          })
          context.useCommand(funCommand, (message, { supply, pending, error }) => {
            pending(message.container, 27)
            error(message.container, 27, false)
            supply(message.container, "Hello from the command!")
          })
        }),
        fact("there is a subscriber to the meta-container", (context) => {
          context.subscribeTo(context.tokens.responseContainer.meta, "meta-sub-1")
        }),
        fact("there is a subscriber to the supplied state", (context) => {
          context.subscribeTo(context.tokens.responseContainer, "sub-1")
        })
      ],
      perform: [
        step("the command is triggered with a message", (context) => {
          context.store.dispatch(exec(context.tokens.command, {
            container: context.tokens.responseContainer
          }))
        })
      ],
      observe: [
        effect("subscribers to the supplied state receive the value", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            "initial value",
            "Hello from the command!"
          ]))
        }),
        effect("the meta subscriber receives meta info about the supplied state", (context) => {
          expect(context.valuesForSubscriber("meta-sub-1"), is(arrayWith([
            okMessage(),
            pendingMessage(27),
            errorMessage(27, false),
            okMessage()
          ])))
        })
      ]

  example(testStoreContext<TestQueryCommandState>())
    .description("Command triggered by a query")
    .script({
      suppose: [
        fact("there is a command triggered by a reactive query", (context) => {
          const keyContainer = container({ initialValue: 27 })
          const reactiveCommand = command({
            query: (get) => {
              return `command-invocation-${get(keyContainer)}`
            }
          })
          let messages: Array<string> = []
          context.useCommand(reactiveCommand, (message) => {
            messages.push(message)
          })
          context.setTokens({
            container: keyContainer,
            messages
          })
        })
      ],
      perform: [
        step("the dependency is updated", (context) => {
          context.writeTo(context.tokens.container, 14)
        }),
        step("the dependency is updated again", (context) => {
          context.writeTo(context.tokens.container, 18)
        })
      ],
      observe: [
        effect("the command is invoked with the initial value and on each subsequent update of the dependency", (context) => {
          expect(context.tokens.messages, is([
            "command-invocation-27",
            "command-invocation-14",
            "command-invocation-18",
          ]))
        })
      ]
    })

])

interface TestQueryCommandState {
  container: Container<number>,
  messages: Array<string>
}