import { Container, StorageHooks, container } from "@src/index";
import { ConfigurableExample, behavior, effect, example, fact, step } from "esbehavior";
import { arrayWith, expect, is } from "great-expectations";
import { errorMessage, okMessage, pendingMessage } from "helpers/metaMatchers";
import { TestTask } from "helpers/testTask";
import { testStoreContext } from "helpers/testStore";

interface BasicStorageHooksContext {
  container: Container<string>
  readyTask: TestTask<string>,
  writeTask: TestTask<string>
}

const basicStorageHooks: ConfigurableExample =
  example(testStoreContext<BasicStorageHooksContext>())
    .description("basic storage hooks usage")
    .script({
      suppose: [
        fact("there is a container with onReady and onWrite storage hooks", (context) => {
          const stringContainer = container({ initialValue: "initial" })
          const readyTask = new TestTask<string>()
          const writeTask = new TestTask<string>()
          const hooks: StorageHooks<string, string> = {
            async onReady(actions) {
              actions.pending(`Loading! Current is: ${actions.current}`)
              const val = await readyTask.waitForIt()
              actions.ok(`Loaded: ${val}`)
            },
            async onWrite(message, actions) {
              actions.pending(`Writing: ${message}; Current is: ${actions.current}`)
              const val = await writeTask.waitForIt()
              actions.ok(`Wrote: ${val}`)
            },
          }
          context.useStorage(stringContainer, hooks)
          context.setTokens({
            container: stringContainer,
            readyTask,
            writeTask
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
        effect("the meta container subscriber receives a loading message", (context) => {
          expect(context.valuesForSubscriber("meta-sub-1"), is(arrayWith([
            pendingMessage("Loading! Current is: initial")
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the ready hook loads and publishes data", (context) => {
          context.tokens.readyTask.resolveWith("Fun stuff!")
        })
      ],
      observe: [
        effect("the container subscriber receives the loaded data", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            "initial",
            "Loaded: Fun stuff!"
          ]))
        }),
        effect("the meta container subscriber receives an ok message", (context) => {
          expect(context.valuesForSubscriber("meta-sub-1"), is(arrayWith([
            pendingMessage("Loading! Current is: initial"),
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
            "Loaded: Fun stuff!"
          ]))
        }),
        effect("the meta container subscriber receives a pending message", (context) => {
          expect(context.valuesForSubscriber("meta-sub-1"), is(arrayWith([
            pendingMessage("Loading! Current is: initial"),
            okMessage(),
            pendingMessage("Writing: A new value!; Current is: Loaded: Fun stuff!")
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
            "Loaded: Fun stuff!",
            "Wrote: Great Values!"
          ]))
        }),
        effect("the meta subscriber receives an ok message", (context) => {
          expect(context.valuesForSubscriber("meta-sub-1"), is(arrayWith([
            pendingMessage("Loading! Current is: initial"),
            okMessage(),
            pendingMessage("Writing: A new value!; Current is: Loaded: Fun stuff!"),
            okMessage()
          ])))
        })
      ]
    })

interface ErrorInReadyHookContext {
  container: Container<string>
}

const errorInReadyHook: ConfigurableExample =
  example(testStoreContext<ErrorInReadyHookContext>())
    .description("when the error meta state is set")
    .script({
      suppose: [
        fact("there is a container with a storage handler that writes errors", (context) => {
          const stringContainer = container({ initialValue: "hello" })
          const hooks: StorageHooks<string, string, number> = {
            async onReady(actions) {
              actions.error(actions.current, 32)
            },
            async onWrite(message, actions) {
              actions.error(message, 61)
            },
          }
          context.useStorage(stringContainer, hooks)
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
        effect("the meta subscriber receives the error messages", (context) => {
          expect(context.valuesForSubscriber("meta-sub"), is(arrayWith([
            errorMessage("hello", 32),
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
    .description("when get state in storage hooks")
    .script({
      suppose: [
        fact("there is a container whose hooks get state", (context) => {
          const one = container({ initialValue: 23 })
          const two = container({ initialValue: "hello" })
          const myContainer = container({ initialValue: "initial" })
          const hooks: StorageHooks<string, string> = {
            async onReady(actions) {
              actions.ok(`Loading: ${actions.get(one)}-${actions.get(two)}`)
            },
            async onWrite(message, actions) {
              actions.ok(`Writing: ${message} & ${actions.get(one)}-${actions.get(two)}`)
            },
          }
          context.useStorage(myContainer, hooks)
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
            "Loading: 23-hello",
            "Writing: some message & 49-funny"
          ]))
        })
      ]
    })

interface AddStorageHookOnRegisterContext {
  container: Container<string>
}

const addStorageHooksOnRegister: ConfigurableExample =
  example(testStoreContext<AddStorageHookOnRegisterContext>())
    .description("when storage hooks are added on register")
    .script({
      suppose: [
        fact("there is a container", (context) => {
          context.setTokens({
            container: container({ initialValue: "hello" })
          })
        }),
        fact("storage hooks are added to a container on register", (context) => {
          context.store.onRegisterState((token) => {
            // fix this
            context.store.useStorage(token as Container<any>, {
              async onReady(actions) {
                actions.ok("Loaded")
              },
              async onWrite(message, actions) {
                actions.ok(`Wrote: ${message}`)
              },
            })
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.tokens.container, "sub")
        })
      ],
      perform: [
        step("a message is written to the container", (context) => {
          context.writeTo(context.tokens.container, "awesome")
        })
      ],
      observe: [
        effect("the subscriber gets the messages", (context) => {
          expect(context.valuesForSubscriber("sub"), is([
            "Loaded",
            "Wrote: awesome"
          ]))
        })
      ]
    })

interface StorageHooksWithReducerContext {
  container: Container<number, string>
}

const storageHooksWithReducer: ConfigurableExample =
  example(testStoreContext<StorageHooksWithReducerContext>())
    .description("when storage hooks are used with a container that has a reducer")
    .script({
      suppose: [
        fact("there is a container with a reducer", (context) => {
          const myContainer = container({
            initialValue: 27,
            reducer: (message: string, current) => {
              if (message === "add") return current + 1
              return current
            }
          })
          context.setTokens({ container: myContainer })
        }),
        fact("storage hooks are associated with the container", (context) => {
          context.useStorage(context.tokens.container, {
            async onReady(actions) {
              actions.ok("add")
            },
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
            28,
            29
          ]))
        })
      ]
    })

export default behavior("Storage Hooks", [
  basicStorageHooks,
  errorInReadyHook,
  getStateInHooks,
  addStorageHooksOnRegister,
  storageHooksWithReducer
])