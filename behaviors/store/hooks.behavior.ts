import { behavior, effect, example, fact, step } from "best-behavior";
import { testStoreContext } from "./helpers/testStore";
import { Container, container, State, useContainerHooks, useHooks } from "@store/index";
import { arrayWith, equalTo, expect, is, objectWithProperty } from "great-expectations";

export default behavior("store hooks", [

  example(testStoreContext<OnRegisterContext>())
    .description("onRegister hook")
    .script({
      suppose: [
        fact("there is an onRegister hook", (context) => {
          context.setTokens({
            stringContainer: container({ name: "string-container", initialValue: "hello" }),
            numberContainer: container({ name: "number-container", initialValue: 27 }),
            registeredContainers: []
          })
          context.tokens.registeredContainers = []
          useHooks(context.store, {
            onRegister(container) {
              context.tokens.registeredContainers.push(container)
            },
          })
        })
      ],
      perform: [
        step("containers are registered with the store", (context) => {
          context.subscribeTo(context.tokens.stringContainer, "string-sub")
          context.subscribeTo(context.tokens.numberContainer, "number-sub")
        })
      ],
      observe: [
        effect("the onRegister hook is called with each container", (context) => {
          expect(context.tokens.registeredContainers, is(arrayWith([
            objectWithProperty("name", equalTo("string-container")),
            objectWithProperty("name", equalTo("number-container"))
          ])))
        }),
        effect("subscribers receive the initial value", (context) => {
          expect(context.valuesForSubscriber("string-sub"), is([
            "hello"
          ]))
          expect(context.valuesForSubscriber("number-sub"), is([
            27
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("a container is updated", (context) => {
          context.writeTo(context.tokens.stringContainer, "Yo!")
        })
      ],
      observe: [
        effect("the subscriber is updated", (context) => {
          expect(context.valuesForSubscriber("string-sub"), is([
            "hello",
            "Yo!"
          ]))
        })
      ]
    }),

  example(testStoreContext<Container<string>>())
    .description("hooks supplies value to registered container")
    .script({
      suppose: [
        fact("there is a container", (context) => {
          context.setTokens(container({ initialValue: "hello" }))
        }),
        fact("a hook that supplies a value", (context) => {
          useHooks(context.store, {
            onRegister(container, actions) {
              if (container === context.tokens) {
                actions.supply("supplied text")
              }
            },
          })
        }),
      ],
      perform: [
        step("register a container", (context) => {
          context.subscribeTo(context.tokens, "sub-one")
        })
      ],
      observe: [
        effect("the subscriber gets the value supplied by the container", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is([
            "supplied text"
          ]))
        })
      ]
    }),

  example(testStoreContext<LogWritesContext>())
    .description("add hook to containers on register")
    .script({
      suppose: [
        fact("initialize the context", (context) => {
          context.setTokens({
            logs: [],
            container: container({ name: "test-container", initialValue: "hello" })
          })
        }),
        fact("there is an onRegister hook that attaches a write hook", (context) => {
          useHooks(context.store, {
            onRegister(container) {
              useContainerHooks(context.store, container, {
                onWrite(message, actions) {
                  context.tokens.logs.push(`[${container.toString()}] => ${JSON.stringify(message)}`)
                  actions.ok(message)
                },
              })
            }
          })
        }),
        fact("add another hook to the container", (context) => {
          useContainerHooks(context.store, context.tokens.container, {
            onWrite(message, actions) {
              actions.ok(`Hooked: ${message}`)
            },
          })
        })
      ],
      perform: [
        step("write to a container", (context) => {
          context.writeTo(context.tokens.container, "One!")
        })
      ],
      observe: [
        effect("all the hooks are applied", (context) => {
          expect(context.tokens.logs, is([
            `[test-container] => "Hooked: One!"`
          ]))
        })
      ]
    })

])

interface OnRegisterContext {
  stringContainer: Container<string>
  numberContainer: Container<number>
  registeredContainers: Array<State<any>>
}

interface LogWritesContext {
  logs: Array<string>
  container: Container<string>
}