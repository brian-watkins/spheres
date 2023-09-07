import { behavior, effect, example, fact, step } from "esbehavior";
import { renderContext } from "./helpers/renderContext.js";
import { makeReactiveTextNode, makeVirtualElement, makeVirtualTextNode, virtualNodeConfig } from "@src/vdom/virtualNode.js";
import { Container, container } from "state-party";
import { selectElement } from "helpers/displayElement.js";
import { expect, is, resolvesTo } from "great-expectations";

interface UnsubscribeContext {
  queryCount: number
  container: Container<string>
}

export default behavior("unsubscribe", [

  example(renderContext<UnsubscribeContext>())
    .description("remove reactive text")
    .script({
      suppose: [
        fact("there is an element with reactive text", (context) => {
          context.setState({
            queryCount: 0,
            container: container({ initialValue: "tennis" })
          })
          context.mount(makeVirtualElement("div", virtualNodeConfig(), [
            makeReactiveTextNode((get) => {
              context.state.queryCount++
              return `My favorite sport is ${get(context.state.container)}`
            })
          ]))
        })
      ],
      observe: [
        effect("the text is displayed", async () => {
          await expect(selectElement("div").text(), resolvesTo("My favorite sport is tennis"))
        }),
        effect("the query was executed", (context) => {
          expect(context.state.queryCount, is(1))
        })
      ]
    }).andThen({
      perform: [
        step("the reactive text is removed", (context) => {
          context.patch(makeVirtualElement("div", virtualNodeConfig(), [
            makeVirtualTextNode("goodbye")
          ]))
        }),
        step("the container is updated", (context) => {
          context.writeTo(context.state.container, "blah")
        })
      ],
      observe: [
        effect("the text is updated", async () => {
          await expect(selectElement("div").text(), resolvesTo("goodbye"))
        }),
        effect("the query is not executed again", (context) => {
          expect(context.state.queryCount, is(1))
        })
      ]
    })

])