import { container, Container, meta, ok, useProvider, withInitialValue, withReducer } from "@src/index";
import { behavior, ConfigurableExample, effect, example, fact } from "esbehavior";
import { arrayWith, equalTo, expect, is } from "great-expectations";
import { okMessage } from "./helpers/metaMatchers";
import { testSubscriberContext } from "./helpers/testSubscriberContext";

interface MetaContext {
  container: Container<number>
}

const basicMetaBehavior: ConfigurableExample =
  example(testSubscriberContext<MetaContext>())
    .description("meta meta container")
    .script({
      suppose: [
        fact("there is a container", (context) => {
          context.setState({
            container: container(withInitialValue(27))
          })
        }),
        fact("there is a subscriber to a meta meta container", (context) => {
          context.subscribeTo(meta(meta(context.state.container)), "meta-meta-sub")
        })
      ],
      observe: [
        effect("the subscriber receives the initial meta meta value", (context) => {
          expect(context.valuesReceivedBy("meta-meta-sub"), is(arrayWith([
            okMessage(ok(27))
          ])))
        })
      ]
    })


interface MetaReducerContext {
  reducerContainer: Container<number, string>
}

const metaContainerWithReducer: ConfigurableExample =
  example(testSubscriberContext<MetaReducerContext>())
    .description("meta container with reducer")
    .script({
      suppose: [
        fact("there is a container with a reducer", (context) => {
          context.setState({
            reducerContainer: container(withReducer(41, (message: string, current) => {
              return message === "add" ? current + 1 : current - 1
            }))
          })
        }),
        fact("there is a subscriber to the container", (context) => {
          context.subscribeTo(context.state.reducerContainer, "sub-one")
        }),
        fact("there is a subscriber to a meta reducer container", (context) => {
          context.subscribeTo(meta(context.state.reducerContainer), "meta-reducer-sub")
        })
      ],
      observe: [
        effect("the subscriber receives the initial container value", (context) => {
          expect(context.valuesReceivedBy("sub-one"), is(equalTo([
            41
          ])))
        }),
        effect("the subscriber receives the initial meta reducer value", (context) => {
          expect(context.valuesReceivedBy("meta-reducer-sub"), is(arrayWith([
            okMessage(41)
          ])))
        })
      ]
    }).andThen({
      suppose: [
        fact("there is a provider for the container", (context) => {
          useProvider({
            provide: (_, set) => {
              set(meta(context.state.reducerContainer), ok("add"))
            }
          })
        })
      ],
      observe: [
        effect("the subscriber receives the provided value", (context) => {
          expect(context.valuesReceivedBy("sub-one"), is(equalTo([
            41,
            42
          ])))
        })
      ]
    })

export default behavior("meta container", [
  basicMetaBehavior,
  metaContainerWithReducer
])