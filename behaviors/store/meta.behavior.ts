import { behavior, ConfigurableExample, effect, example, fact, step } from "best-behavior";
import { arrayWith, equalTo, expect, is } from "great-expectations";
import { okMessage, pendingMessage } from "./helpers/metaMatchers.js";
import { container, Container, Meta, derived, DerivedState, meta } from "@store/index.js";
import { testStoreContext, TestStore } from "./helpers/testStore.js";

interface MetaContext {
  container: Container<number>
}

const basicMetaBehavior: ConfigurableExample =
  example(testStoreContext<MetaContext>())
    .description("basic meta container")
    .script({
      suppose: [
        fact("there is a container", (context) => {
          context.setTokens({
            container: container({ name: "fun-container", initialValue: 27 })
          })
        }),
        fact("there is a subscriber to the meta container", (context) => {
          context.subscribeTo(meta(context.tokens.container), "meta-sub")
        })
      ],
      observe: [
        effect("the subscriber receives the initial meta value", (context) => {
          expect(context.valuesForSubscriber("meta-sub"), is(arrayWith([
            okMessage()
          ])))
        }),
        effect("the name of the container is included in the stringified meta token", (context) => {
          expect(meta(context.tokens.container).toString(), is("meta[fun-container]"))
        })
      ]
    })

interface MetaReducerContext {
  reducerContainer: Container<number, string>
}

const metaContainerWithReducer: ConfigurableExample =
  example(testStoreContext<MetaReducerContext>())
    .description("meta container with reducer")
    .script({
      suppose: [
        fact("there is a container with a reducer and a writer", (context) => {
          context.setTokens({
            reducerContainer: container({
              initialValue: 41,
              update: (message, current) => {
                return { value: message === "add" ? current + 1 : current - 1 }
              }
            })
          })
          context.useContainerHooks(context.tokens.reducerContainer, {
            async onWrite(message, actions) {
              actions.pending(message)
            }
          })
        }),
        fact("there is a subscriber to the container", (context) => {
          context.subscribeTo(context.tokens.reducerContainer, "sub-one")
        }),
        fact("there is a subscriber to a meta reducer container", (context) => {
          context.subscribeTo(meta(context.tokens.reducerContainer), "meta-reducer-sub")
        })
      ],
      observe: [
        effect("the subscriber receives the initial container value", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            41
          ])))
        }),
        effect("the subscriber receives the initial meta reducer value", (context) => {
          expect(context.valuesForSubscriber("meta-reducer-sub"), is(arrayWith([
            okMessage()
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("a message is written to the container", (context) => {
          context.writeTo(context.tokens.reducerContainer, "add")
        })
      ],
      observe: [
        effect("the subscriber receives nothing", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            41
          ])))
        }),
        effect("the meta subscriber receives the pending message", (context) => {
          expect(context.valuesForSubscriber("meta-reducer-sub"), is(arrayWith([
            okMessage(),
            pendingMessage("add")
          ])))
        })
      ]
    })

interface MetaErrorContext {
  container: Container<string>
  derived: DerivedState<number>
}

const metaErrorBehavior: ConfigurableExample =
  example(testStoreContext<MetaErrorContext>())
    .description("properly typing the error reason")
    .script({
      suppose: [
        fact("there is a container", (context) => {
          context.setTokens({
            container: container({ initialValue: "hello" }),
            derived: derived({
              query: get => {
                const metaValue = get<Meta<string, number>>(meta(context.tokens.container))
                switch (metaValue.type) {
                  case "ok":
                  case "pending":
                    return 7
                  case "error":
                    return metaValue.reason
                }
              }
            })
          })
          context.useContainerHooks(context.tokens.container, {
            async onWrite(_, actions) {
              actions.error(37, "goodbye")
            },
          })
        }),
        fact("there is a subscriber to the derived value", (context) => {
          context.subscribeTo(context.tokens.derived, "sub-one")
        })
      ],
      perform: [
        step("an error is written to the meta container", (context) => {
          context.writeTo(context.tokens.container, "blah")
        })
      ],
      observe: [
        effect("the derived value deals with the error", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            7,
            37
          ])))
        })
      ]
    })


interface MetaPublishCycleContext {
  container: Container<string>
  log: Array<string>
}

function containerWithPendingThenOk(context: TestStore<MetaPublishCycleContext>) {
  context.setTokens({
    container: container({ initialValue: "initial" }),
    log: []
  })
  context.useContainerHooks(context.tokens.container, {
    onWrite(message, actions) {
      if (message === "load") {
        actions.pending(message)
      } else {
        actions.ok(message)
      }
    }
  })
}

const metaGlitchBehavior: ConfigurableExample =
  example(testStoreContext<MetaPublishCycleContext>())
    .description("effect that depends on meta state and state derived from the container")
    .script({
      suppose: [
        fact("there is a container whose hooks set pending and then ok", containerWithPendingThenOk),
        fact("there is an effect that subscribes to the meta state before derived state", (context) => {
          const label = derived(get => `Derived ${get(context.tokens.container)}`)
          context.registerEffect("sub", (get) => `${get(meta(context.tokens.container)).type}: ${get(label)}`)
        })
      ],
      perform: [
        step("a pending message is written", (context) => {
          context.writeTo(context.tokens.container, "load")
        }),
        step("an ok message is written", (context) => {
          context.writeTo(context.tokens.container, "loaded")
        })
      ],
      observe: [
        effect("the effect never observes inconsistent state", (context) => {
          expect(context.valuesForSubscriber("sub"), is(equalTo([
            "ok: Derived initial",
            "pending: Derived initial",
            "ok: Derived loaded"
          ])))
        })
      ]
    })

const metaEffectOrderBehavior: ConfigurableExample =
  example(testStoreContext<MetaPublishCycleContext>())
    .description("user effect on meta state and element effect on the container")
    .script({
      suppose: [
        fact("there is a container whose hooks set pending and then ok", containerWithPendingThenOk),
        fact("there is an element effect on the container", (context) => {
          context.registerSystemEffect("element", (get) => {
            context.tokens.log.push(`element: ${get(context.tokens.container)}`)
          })
        }),
        fact("there is a user effect on the meta state", (context) => {
          context.registerEffect("user", (get) => {
            context.tokens.log.push(`user: ${get(meta(context.tokens.container)).type}`)
          })
        })
      ],
      perform: [
        step("a pending message is written", (context) => {
          context.writeTo(context.tokens.container, "load")
        }),
        step("an ok message is written", (context) => {
          context.writeTo(context.tokens.container, "loaded")
        })
      ],
      observe: [
        effect("element effects run before user effects", (context) => {
          expect(context.tokens.log, is(equalTo([
            "element: initial",
            "user: ok",
            "user: pending",
            "element: loaded",
            "user: ok"
          ])))
        })
      ]
    })

export default behavior("meta container", [
  basicMetaBehavior,
  metaContainerWithReducer,
  metaErrorBehavior,
  metaGlitchBehavior,
  metaEffectOrderBehavior
])