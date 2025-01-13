import { behavior, ConfigurableExample, effect, example, fact, step } from "best-behavior";
import { arrayWith, equalTo, expect, is } from "great-expectations";
import { okMessage, pendingMessage } from "./helpers/metaMatchers.js";
import { container, Container, Meta, derived, DerivedState } from "@src/index.js";
import { testStoreContext } from "./helpers/testStore.js";

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
          context.subscribeTo(context.tokens.container.meta, "meta-sub")
        })
      ],
      observe: [
        effect("the subscriber receives the initial meta value", (context) => {
          expect(context.valuesForSubscriber("meta-sub"), is(arrayWith([
            okMessage()
          ])))
        }),
        effect("the name of the container is included in the stringified meta token", (context) => {
          expect(context.tokens.container.meta.toString(), is("meta[fun-container]"))
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
          context.subscribeTo(context.tokens.reducerContainer.meta, "meta-reducer-sub")
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
                const metaValue = get<Meta<string, number>>(context.tokens.container.meta)
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
              actions.error("goodbye", 37)
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

export default behavior("meta container", [
  basicMetaBehavior,
  metaContainerWithReducer,
  metaErrorBehavior
])