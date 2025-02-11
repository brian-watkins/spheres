import { Command, Container, StateCollection, SuppliedState, collection, command, container, exec, supplied } from "@src/index";
import { behavior, effect, example, fact, step } from "best-behavior";
import { arrayWith, expect, is } from "great-expectations";
import { errorMessage, okMessage, pendingMessage } from "helpers/metaMatchers";
import { testStoreContext } from "helpers/testStore";
import { TestTask } from "helpers/testTask";

interface FunCommandMessage {
  name: string
  value: number
}

interface TestCommandContext {
  command: Command<FunCommandMessage>
  messages: Array<FunCommandMessage>
}

interface TestCommandStateContext {
  command: Command<{ container: SuppliedState<string, boolean> }>
  responseContainer: SuppliedState<string, boolean>
  task: TestTask<string, boolean>
}

interface TestCommandGetStateContext {
  command: Command<{ container: SuppliedState<number> }>,
  state: SuppliedState<number>
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
          const funCommand = command<{ container: SuppliedState<string, boolean> }>()
          const task = new TestTask<string, boolean>()
          context.setTokens({
            command: funCommand,
            responseContainer: supplied<string, boolean>({ initialValue: "initial value" }),
            task
          })
          context.useCommand(funCommand, async (message, { supply, pending, error }) => {
            pending(message.container)
            const result = await task.waitForIt()
            if (result === "show-error") {
              error(message.container, false)
            } else {
              supply(message.container, `Hello from the command! (${result})`)
            }
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
        }),
        step("the task resolves and causes an error", (context) => {
          context.tokens.task.resolveWith("show-error")
        }),
        step("the command is triggered again", (context) => {
          context.store.dispatch(exec(context.tokens.command, {
            container: context.tokens.responseContainer
          }))
        }),
        step("the task resolves and causes a supply", (context) => {
          context.tokens.task.resolveWith("Fun!")
        })
      ],
      observe: [
        effect("subscribers to the supplied state receive the supplied value", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            "initial value",
            "Hello from the command! (Fun!)"
          ]))
        }),
        effect("the meta subscriber receives meta info about the supplied state", (context) => {
          expect(context.valuesForSubscriber("meta-sub-1"), is(arrayWith([
            okMessage(),
            pendingMessage(undefined),
            errorMessage(undefined, false),
            pendingMessage(undefined),
            okMessage()
          ])))
        })
      ]
    }),

  example(testStoreContext<TestCommandGetStateContext>())
    .description("get state when processing a command")
    .script({
      suppose: [
        fact("there is a command that gets state value", (context) => {
          const counter = supplied({ initialValue: 0 })
          const incrementCommand = command<{ container: SuppliedState<number> }>()
          context.setTokens({
            command: incrementCommand,
            state: counter
          })
          context.useCommand(incrementCommand, (message, { get, supply }) => {
            supply(message.container, get(message.container) + 1)
          })
        }),
        fact("there is a subscriber to the state", (context) => {
          context.subscribeTo(context.tokens.state, "sub-1")
        })
      ],
      perform: [
        step("execute the command", (context) => {
          context.store.dispatch(exec(context.tokens.command, { container: context.tokens.state }))
        }),
        step("execute the command", (context) => {
          context.store.dispatch(exec(context.tokens.command, { container: context.tokens.state }))
        }),
        step("execute the command", (context) => {
          context.store.dispatch(exec(context.tokens.command, { container: context.tokens.state }))
        })
      ],
      observe: [
        effect("the subscriber gets the updates", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            0,
            1,
            2,
            3
          ]))
        })
      ]
    }),

  example(testStoreContext<TestQueryCommandState>())
    .description("Command triggered by a query")
    .script({
      suppose: [
        fact("there is a command triggered by a reactive query", (context) => {
          const keyContainer = container({ initialValue: 27 })
          const reactiveCommand = command({
            trigger: (get) => {
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
    }),

  example(testStoreContext<SuppliedStateWithIdContext>())
    .description("supplied state referenced by id via a collection")
    .script({
      suppose: [
        fact("there is a command", (context) => {
          const myCommand = command<string>()
          const task = new TestTask<string>()
          const suppliedCollection = collection(() => supplied({ initialValue: "initial" }))
          context.setTokens({
            collection: suppliedCollection,
            command: myCommand,
            task
          })
          context.useCommand(myCommand, async (message, actions) => {
            actions.pending(suppliedCollection.get("fun-stuff"))
            await task.waitForIt()
            actions.supply(suppliedCollection.get("fun-stuff"), `From command: ${message}`)
          })
        }),
        fact("there is a subscriber to the supplied state", (context) => {
          context.subscribeTo(context.tokens.collection.get("fun-stuff"), "supplied-sub")
        }),
        fact("there is a subscriber to the meta state", (context) => {
          context.subscribeTo(context.tokens.collection.get("fun-stuff").meta, "meta-supplied-sub")
        })
      ],
      perform: [
        step("the command is executed", (context) => {
          context.store.dispatch(exec(context.tokens.command, "yo yo yo"))
        }),
        step("the command's task resolves", (context) => {
          context.tokens.task.resolveWith("hello")
        })
      ],
      observe: [
        effect("the subscriber gets the values", (context) => {
          expect(context.valuesForSubscriber("supplied-sub"), is([
            "initial",
            "From command: yo yo yo"
          ]))
        }),
        effect("the meta subscriber gets the values", (context) => {
          expect(context.valuesForSubscriber("meta-supplied-sub"), is(arrayWith([
            okMessage(),
            pendingMessage(undefined),
            okMessage()
          ])))
        })
      ]
    }),

  example(testStoreContext<SuppliedState<string, string>>())
    .description("when the name is set")
    .script({
      suppose: [
        fact("there is a derived state with a name", (context) => {
          context.setTokens(supplied({
            name: "fun-stuff",
            initialValue: ""
          }))
        })
      ],
      observe: [
        effect("the string name includes the supplied state name", (context) => {
          expect(context.tokens.toString(), is("fun-stuff"))
        })
      ]
    })

])

interface SuppliedStateWithIdContext {
  collection: StateCollection<SuppliedState<string>>
  command: Command<string>
  task: TestTask<string>
}

interface TestQueryCommandState {
  container: Container<number>,
  messages: Array<string>
}