import { Container, ContainerHooks, container } from "@src/index";
import { ConfigurableExample, behavior, effect, example, fact, step } from "best-behavior";
import { arrayWith, expect, is } from "great-expectations";
import { errorMessage, okMessage, pendingMessage } from "helpers/metaMatchers";
import { TestTask } from "helpers/testTask";
import { testStoreContext } from "helpers/testStore";

interface BasicContainerHooksContext {
  container: Container<string>
  writeTask: TestTask<string>
}

const basicContainerHooks: ConfigurableExample =
  example(testStoreContext<BasicContainerHooksContext>())
    .description("basic container hooks usage")
    .script({
      suppose: [
        fact("there is a container with onWrite hooks", (context) => {
          const stringContainer = container({ initialValue: "initial" })
          const writeTask = new TestTask<string>()
          const hooks: ContainerHooks<string, string> = {
            async onWrite(message, actions) {
              actions.pending(`Writing: ${message}; Current is: ${actions.current}`)
              const val = await writeTask.waitForIt()
              actions.ok(`Wrote: ${val}`)
            }
          }
          context.useContainerHooks(stringContainer, hooks)
          context.setTokens({
            container: stringContainer,
            writeTask,
          })
        }),
        fact("there is a subscriber to the container", (context) => {
          context.subscribeTo(context.tokens.container, "sub-1")
        }),
        fact("there is a subscriber to the meta container", (context) => {
          context.subscribeTo(context.tokens.container.meta, "meta-sub-1")
        })
      ],
      observe: [
        effect("the container subscriber receives the initial value", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            "initial"
          ]))
        }),
        effect("the meta container subscriber receives an ok message", (context) => {
          expect(context.valuesForSubscriber("meta-sub-1"), is(arrayWith([
            okMessage()
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("a message is written to the container", (context) => {
          context.writeTo(context.tokens.container, "A new value!")
        })
      ],
      observe: [
        effect("the container subscriber receives nothing yet", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            "initial",
          ]))
        }),
        effect("the meta container subscriber receives a pending message from the onWrite hook", (context) => {
          expect(context.valuesForSubscriber("meta-sub-1"), is(arrayWith([
            okMessage(),
            pendingMessage("Writing: A new value!; Current is: initial")
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the write hook resolves with some data", (context) => {
          context.tokens.writeTask.resolveWith("Great Values!")
        })
      ],
      observe: [
        effect("the container subscriber receives the published value", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            "initial",
            "Wrote: Great Values!"
          ]))
        }),
        effect("the meta subscriber receives an ok message", (context) => {
          expect(context.valuesForSubscriber("meta-sub-1"), is(arrayWith([
            okMessage(),
            pendingMessage("Writing: A new value!; Current is: initial"),
            okMessage()
          ])))
        })
      ]
    })

interface ErrorInWriteHookContext {
  container: Container<string>
}

const errorInWriteHook: ConfigurableExample =
  example(testStoreContext<ErrorInWriteHookContext>())
    .description("when the error meta state is set in the write hook")
    .script({
      suppose: [
        fact("there is a container with a hooks that writes errors", (context) => {
          const stringContainer = container({ initialValue: "hello" })
          const hooks: ContainerHooks<string, string, number> = {
            async onWrite(message, actions) {
              actions.error(61, message)
            },
          }
          context.useContainerHooks(stringContainer, hooks)
          context.setTokens({
            container: stringContainer
          })
        }),
        fact("there is a subscriber to the container", (context) => {
          context.subscribeTo(context.tokens.container, "sub-1")
        }),
        fact("there is a subscriber to the meta container", (context) => {
          context.subscribeTo(context.tokens.container.meta, "meta-sub")
        })
      ],
      perform: [
        step("a message is written to the container", (context) => {
          context.writeTo(context.tokens.container, "another message")
        })
      ],
      observe: [
        effect("the subscriber just receives the initial value", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            "hello"
          ]))
        }),
        effect("the meta subscriber receives the error message", (context) => {
          expect(context.valuesForSubscriber("meta-sub"), is(arrayWith([
            okMessage(),
            errorMessage("another message", 61)
          ])))
        })
      ]
    })

interface GetStateInHooksContext {
  one: Container<number>
  two: Container<string>
  container: Container<string>
}

const getStateInHooks: ConfigurableExample =
  example(testStoreContext<GetStateInHooksContext>())
    .description("when get state in container hooks")
    .script({
      suppose: [
        fact("there is a container whose hooks get state", (context) => {
          const one = container({ initialValue: 23 })
          const two = container({ initialValue: "hello" })
          const myContainer = container({ initialValue: "initial" })
          const hooks: ContainerHooks<string, string> = {
            onWrite(message, actions) {
              actions.ok(`Writing: ${message} & ${actions.get(one)}-${actions.get(two)}`)
            }
          }
          context.useContainerHooks(myContainer, hooks)
          context.setTokens({
            one,
            two,
            container: myContainer
          })
        }),
        fact("there is a subscriber to the container", (context) => {
          context.subscribeTo(context.tokens.container, "sub-1")
        })
      ],
      perform: [
        step("the dependencies are updated", (context) => {
          context.writeTo(context.tokens.one, 49)
          context.writeTo(context.tokens.two, "funny")
        }),
        step("a message is written to the container", (context) => {
          context.writeTo(context.tokens.container, "some message")
        })
      ],
      observe: [
        effect("the subscriber receives the messages", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            "initial",
            "Writing: some message & 49-funny"
          ]))
        })
      ]
    })

interface ContainerHooksWithReducerContext {
  container: Container<number, string>
}

const containerHooksWithReducer: ConfigurableExample =
  example(testStoreContext<ContainerHooksWithReducerContext>())
    .description("when container hooks are used with a container that has a reducer")
    .script({
      suppose: [
        fact("there is a container with a reducer", (context) => {
          const myContainer = container({
            initialValue: 27,
            update: (message: string, current) => {
              if (message === "add") return { value: current + 1 }
              return { value: current }
            }
          })
          context.setTokens({ container: myContainer })
        }),
        fact("container hooks are associated with the container", (context) => {
          context.useContainerHooks(context.tokens.container, {
            async onWrite(message, actions) {
              if (message === "increment") {
                actions.ok("add")
              } else {
                actions.ok("nothing")
              }
            },
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.tokens.container, "funny-sub")
        })
      ],
      perform: [
        step("write an add message to the container that will be ignored", (context) => {
          context.writeTo(context.tokens.container, "add")
        }),
        step("write an add message to the container that will be processed", (context) => {
          context.writeTo(context.tokens.container, "increment")
        })
      ],
      observe: [
        effect("the subscriber receives the messages", (context) => {
          expect(context.valuesForSubscriber("funny-sub"), is([
            27,
            28
          ]))
        })
      ]
    })

export default behavior("Container Hooks", [
  basicContainerHooks,
  errorInWriteHook,
  getStateInHooks,
  containerHooksWithReducer
])