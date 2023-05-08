import { behavior, ConfigurableExample, effect, example, fact } from "esbehavior";
import { arrayWith, equalTo, expect, is } from "great-expectations";
import { okMessage, pendingMessage } from "./helpers/metaMatchers";
import { container, Container, pending, withInitialValue, withReducer } from "@src/store";
import { testStoreContext } from "./helpers/testStore";

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
            container: container(withInitialValue(27))
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
            container: container(withInitialValue(27))
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
            reducerContainer: container(withReducer(41, (message: string, current) => {
              return message === "add" ? current + 1 : current - 1
            }))
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

export default behavior("meta container", [
  basicMetaBehavior,
  metaMetaBehavior,
  metaContainerWithReducer
])