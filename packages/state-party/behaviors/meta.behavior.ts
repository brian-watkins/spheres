import { behavior, ConfigurableExample, effect, example, fact, step } from "esbehavior";
import { arrayWith, equalTo, expect, is, objectOfType, objectWithProperty, satisfying, throws } from "great-expectations";
import { errorMessage, okMessage, pendingMessage } from "./helpers/metaMatchers.js";
import { container, Container, error, Meta, pending, StoreError, value, Value } from "@src/index.js";
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
            container: container({ initialValue: 27 })
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
        })
      ]
    })

const metaMetaBehavior: ConfigurableExample =
  example(testStoreContext<MetaContext>())
    .description("meta meta container")
    .script({
      suppose: [
        fact("there is a container", (context) => {
          context.setTokens({
            container: container({ initialValue: 27 })
          })
        }),
        fact("there is a subscriber to a meta meta container", (context) => {
          context.subscribeTo(context.tokens.container.meta.meta, "meta-meta-sub")
        })
      ],
      observe: [
        effect("the subscriber receives the initial meta meta value", (context) => {
          expect(context.valuesForSubscriber("meta-meta-sub"), is(arrayWith([
            okMessage()
          ])))
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
        fact("there is a container with a reducer", (context) => {
          context.setTokens({
            reducerContainer: container({
              initialValue: 41,
              reducer: (message, current) => {
                return message === "add" ? current + 1 : current - 1
              }
            })
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
      suppose: [
        fact("there is a provider for the container", (context) => {
          context.useProvider({
            provide: ({ set }) => {
              set(context.tokens.reducerContainer.meta, pending("add"))
            }
          })
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
  derived: Value<number>
}

const metaErrorBehavior: ConfigurableExample =
  example(testStoreContext<MetaErrorContext>())
    .description("properly typing the error reason")
    .script({
      suppose: [
        fact("there is a container", (context) => {
          context.setTokens({
            container: container({ initialValue: "hello" }),
            derived: value({
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
        }),
        fact("there is a subscriber to the derived value", (context) => {
          context.subscribeTo(context.tokens.derived, "sub-one")
        })
      ],
      perform: [
        step("an error is written to the meta container", (context) => {
          context.useProvider({
            provide: ({ set }) => {
              set(context.tokens.container.meta, error("goodbye", 37))
            }
          })
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

interface TestContainer {
  container: Container<string>
}

const containerQueryInitError: ConfigurableExample =
  example(testStoreContext<TestContainer>())
    .description("container query throws an exception on initial run")
    .script({
      suppose: [
        fact("there is a container with a query that throws an error", (context) => {
          context.setTokens({
            container: container({
              initialValue: "initial",
              query: (({ current }) => {
                throw `Error processing ${current}!`
              })
            }) as unknown as Container<string>
          })
        }),
        fact("there is a subscriber and a meta subscriber", (context) => {
          context.subscribeTo(context.tokens.container, "sub-one")
          context.subscribeTo(context.tokens.container.meta, "meta-sub-one")
        })
      ],
      observe: [
        effect("the initial value is published to the subscriber", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "initial"
          ])))
        }),
        effect("the meta state is in error with the thrown reason", (context) => {
          expect(context.valuesForSubscriber("meta-sub-one"), is(arrayWith([
            okMessage(),
            errorMessage(undefined, "Error processing initial!")
          ])))
        })
      ]
    })

const containerQueryError: ConfigurableExample =
  example(testStoreContext<TestContainer>())
    .description("container query throws error after initialization")
    .script({
      suppose: [
        fact("there is a container with a query", (context) => {
          context.setTokens({
            container: container({
              initialValue: "initial",
              query: (({ current }, next) => {
                if (next !== undefined) {
                  throw `Error processing ${next}!`
                }
                return current
              })
            })
          })
        }),
        fact("there is a subscriber and a meta subscriber", (context) => {
          context.subscribeTo(context.tokens.container, "sub-one")
          context.subscribeTo(context.tokens.container.meta, "meta-sub-one")
        })
      ],
      perform: [
        step("an error is thrown in the query", (context) => {
          context.writeTo(context.tokens.container, "hello")
        })
      ],
      observe: [
        effect("the initial value is published to the subscriber", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "initial"
          ])))
        }),
        effect("the meta state is in error with the thrown reason", (context) => {
          expect(context.valuesForSubscriber("meta-sub-one"), is(arrayWith([
            okMessage(),
            errorMessage("hello", "Error processing hello!")
          ])))
        })
      ]
    })

interface TestContainerWithDependency {
  dependency: Container<number>
  container: Container<string>
}

const containerQueryDependencyError: ConfigurableExample =
  example(testStoreContext<TestContainerWithDependency>())
    .description("container query throws error after dependency change triggers update")
    .script({
      suppose: [
        fact("there is a container with a query and a dependency", (context) => {
          const dep = container({ initialValue: 17 })
          context.setTokens({
            dependency: dep,
            container: container({
              initialValue: "initial",
              query: (({ get, current }) => {
                if (get(context.tokens.dependency) > 20) {
                  throw `Error processing dependency ${get(context.tokens.dependency)}!!`
                }
                return current
              })
            })
          })
        }),
        fact("there is a subscriber and a meta subscriber", (context) => {
          context.subscribeTo(context.tokens.container, "sub-one")
          context.subscribeTo(context.tokens.container.meta, "meta-sub-one")
        })
      ],
      perform: [
        step("the dependency is updated, triggering an error", (context) => {
          context.writeTo(context.tokens.dependency, 27)
        })
      ],
      observe: [
        effect("the initial value is published to the subscriber", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "initial"
          ])))
        }),
        effect("the meta state is in error with the thrown reason", (context) => {
          expect(context.valuesForSubscriber("meta-sub-one"), is(arrayWith([
            okMessage(),
            errorMessage(undefined, "Error processing dependency 27!!")
          ])))
        })
      ]
    })

const containerReducerError: ConfigurableExample =
  example(testStoreContext<TestContainer>())
    .description("container reducer throws error after initialization")
    .script({
      suppose: [
        fact("there is a container with a reducer", (context) => {
          context.setTokens({
            container: container({
              initialValue: "initial",
              reducer: ((message) => {
                if (message === "boom") {
                  throw `Error processing ${message}!`
                }
                return message
              })
            })
          })
        }),
        fact("there is a subscriber and a meta subscriber", (context) => {
          context.subscribeTo(context.tokens.container, "sub-one")
          context.subscribeTo(context.tokens.container.meta, "meta-sub-one")
        })
      ],
      perform: [
        step("an error is thrown in the reducer", (context) => {
          context.writeTo(context.tokens.container, "boom")
        })
      ],
      observe: [
        effect("the initial value is published to the subscriber", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "initial"
          ])))
        }),
        effect("the meta state is in error with the thrown reason", (context) => {
          expect(context.valuesForSubscriber("meta-sub-one"), is(arrayWith([
            okMessage(),
            errorMessage("boom", "Error processing boom!")
          ])))
        })
      ]
    })

interface TestValueWithDependency {
  dependency: Container<number>
  value: Value<string>
}

const valueQueryInitError: ConfigurableExample =
  example(testStoreContext<TestValueWithDependency>())
    .description("value query throws error upon init")
    .script({
      suppose: [
        fact("there is a value with a dependency", (context) => {
          const dep = container({ initialValue: 88 })
          context.setTokens({
            dependency: dep,
            value: value({
              name: "bad-value",
              query: ((get) => {
                if (get(context.tokens.dependency) > 0) {
                  throw `Error processing dependency ${get(context.tokens.dependency)}!!`
                }
                return "0"
              })
            })
          })
        })
      ],
      observe: [
        effect("an initialization error is thrown when the value is initialized", (context) => {
          expect(() => {
            context.subscribeTo(context.tokens.value, "sub-one")
          }, throws(satisfying([
            objectOfType(StoreError),
            objectWithProperty("message", equalTo("Unable to initialize value: bad-value")),
            objectWithProperty("cause", equalTo("Error processing dependency 88!!"))
          ])))
        })
      ]
    })

const valueQueryDependencyError: ConfigurableExample =
  example(testStoreContext<TestValueWithDependency>())
    .description("value query throws error after dependency change triggers update")
    .script({
      suppose: [
        fact("there is a value with a dependency", (context) => {
          const dep = container({ initialValue: 88 })
          context.setTokens({
            dependency: dep,
            value: value({
              query: ((get) => {
                if (get(context.tokens.dependency) < 20) {
                  throw `Error processing dependency ${get(context.tokens.dependency)}!!`
                }
                return "91"
              })
            })
          })
        }),
        fact("there is a subscriber and a meta subscriber", (context) => {
          context.subscribeTo(context.tokens.value, "sub-one")
          context.subscribeTo(context.tokens.value.meta, "meta-sub-one")
        })
      ],
      perform: [
        step("the dependency is updated, triggering an error", (context) => {
          context.writeTo(context.tokens.dependency, 8)
        })
      ],
      observe: [
        effect("the initial value is published to the subscriber", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "91"
          ])))
        }),
        effect("the meta state is in error with the thrown reason", (context) => {
          expect(context.valuesForSubscriber("meta-sub-one"), is(arrayWith([
            okMessage(),
            errorMessage(undefined, "Error processing dependency 8!!")
          ])))
        })
      ]
    })

export default behavior("meta container", [
  basicMetaBehavior,
  metaMetaBehavior,
  metaContainerWithReducer,
  metaErrorBehavior,
  containerQueryInitError,
  containerQueryError,
  containerQueryDependencyError,
  containerReducerError,
  valueQueryInitError,
  valueQueryDependencyError
])