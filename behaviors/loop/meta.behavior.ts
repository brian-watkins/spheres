import { container, Container, meta, ok, withInitialValue } from "@src/index";
import { behavior, effect, example, fact } from "esbehavior";
import { arrayWith, expect, is } from "great-expectations";
import { okMessage } from "./helpers/metaMatchers";
import { testSubscriberContext } from "./helpers/testSubscriberContext";

interface MetaContext {
  container: Container<number>
}

export default behavior("meta container", [
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
])